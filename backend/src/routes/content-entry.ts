import { Router, Request, Response, NextFunction } from 'express';
import {
  authenticateJWT
} from '../middleware/auth';
import { ContentBank, ContentEntry, ContentEntriesBank } from '../models';
import { createUserSpecificLimiter } from '../middleware/rateLimiter';

const router = Router();

// Interface for source creation request
interface CreateSourceRequest {
  sourceUrl?: string;
  content?: string;
  type: 'full_html' | 'selected_text';
  pageTitle?: string;
  bankId: number;
}

// Interface for source update request
interface UpdateSourceRequest {
  sourceUrl?: string;
  content?: string;
  type?: 'full_html' | 'selected_text';
  pageTitle?: string;
  promptSummary?: string;
}

export const sourceCreationLimiter = createUserSpecificLimiter(
  5 * 60 * 1000, // 5 minutes
  10 // 10 sources per user
);

// GET route to list all content entries for a specific bank
router.get('/bank/:bankId', authenticateJWT, async function (req: Request, res: Response, next: NextFunction) {
  try {
    const { bankId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify that the bank belongs to the user
    const contentBank = await ContentBank.query()
      .where('id', bankId)
      .where('user_id', (req.user as any).id)
      .first();

    if (!contentBank) {
      return res.status(404).json({ error: 'Content bank not found or does not belong to user' });
    }

    // Get content entries for the bank with pagination
    const contentEntries = await ContentEntry.query()
      .select('content_entries.id', 'content_entries.content_type', 'content_entries.content', 'content_entries.source_url', 'content_entries.page_title', 'content_entries.created_at')
      .join('content_entries_bank', 'content_entries.id', 'content_entries_bank.content_entry_id')
      .where('content_entries_bank.content_bank_id', bankId)
      .orderBy('content_entries.created_at', 'desc')
      .page(Number(page) - 1, Number(limit));

    res.json({
      entries: contentEntries.results.map(entry => ({
        id: entry.id,
        contentType: entry.content_type,
        content: entry.content,
        sourceUrl: entry.source_url,
        pageTitle: entry.page_title,
        createdAt: entry.created_at
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: contentEntries.total
      }
    });
  } catch (error) {
    console.error('Error fetching content entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET route to get a single content entry by ID
router.get('/:id', authenticateJWT, async function (req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Get the content entry and verify user ownership through the bank
    const contentEntry = await ContentEntry.query()
      .select('content_entries.*', 'content_banks.user_id')
      .join('content_entries_bank', 'content_entries.id', 'content_entries_bank.content_entry_id')
      .join('content_banks', 'content_entries_bank.content_bank_id', 'content_banks.id')
      .where('content_entries.id', id)
      .where('content_banks.user_id', (req.user as any).id)
      .first();

    if (!contentEntry) {
      return res.status(404).json({ error: 'Content entry not found or does not belong to user' });
    }

    res.json({
      id: contentEntry.id,
      sourceUrl: contentEntry.source_url,
      content: contentEntry.content,
      pageTitle: contentEntry.page_title,
      contentType: contentEntry.content_type, 
      createdAt: contentEntry.created_at
    });
  } catch (error) {
    console.error('Error fetching content entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST route to create a new source
router.post('/', authenticateJWT, sourceCreationLimiter, async function (req: Request<{}, {}, CreateSourceRequest>, res: Response, next: NextFunction) {
  try {
    const { sourceUrl, content, type, pageTitle, bankId } = req.body;

    // Validation
    if (!type || !['full_html', 'selected_text'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "full_html" or "selected_text"' });
    }

    if (!bankId) {
      return res.status(400).json({ error: 'Bank ID is required' });
    }

    // Validate type-specific requirements
    if (type === 'full_html' && !sourceUrl) {
      return res.status(400).json({ error: 'Source URL is required when type is "full_html"' });
    }

    if (type === 'selected_text' && !content) {
      return res.status(400).json({ error: 'Content is required when type is "selected_text"' });
    }

    // Verify that the bank belongs to the user 
    const contentBank = await ContentBank.query()
      .where('id', bankId)
      .where('user_id', (req.user as any).id)
      .first();

    if (!contentBank) {
      return res.status(404).json({ error: 'Content bank not found or does not belong to user' });
    }

    const sourceData = {
      content_type: type,
      source_url: sourceUrl,
      content: content,
      page_title: pageTitle
    };

    const newSource = await ContentEntry.query().insert(sourceData);

    await ContentEntriesBank.query().insert({
      content_entry_id: newSource.id,
      content_bank_id: bankId
    });

    res.status(201).json({
      id: newSource.id,
      sourceUrl: newSource.source_url,
      content: newSource.content,
      pageTitle: newSource.page_title,
      contentType: newSource.content_type,
      createdAt: newSource.created_at
    });
  } catch (error) {
    console.error('Error creating source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE route to delete a content entry
router.delete('/:id', authenticateJWT, async function (req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Get the content entry and verify user ownership through the bank
    const existingEntry = await ContentEntry.query()
      .select('content_entries.*', 'content_banks.user_id')
      .join('content_entries_bank', 'content_entries.id', 'content_entries_bank.content_entry_id')
      .join('content_banks', 'content_entries_bank.content_bank_id', 'content_banks.id')
      .where('content_entries.id', id)
      .where('content_banks.user_id', (req.user as any).id)
      .first();

    if (!existingEntry) {
      return res.status(404).json({ error: 'Content entry not found or does not belong to user' });
    }

    // Delete the content entry (this will cascade delete the relationship in content_entries_bank)
    await ContentEntry.query().deleteById(id);

    res.json({ message: 'Content entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting content entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;