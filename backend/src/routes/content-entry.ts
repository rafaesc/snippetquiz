import { Router, Request, Response, NextFunction } from 'express';
import {
  authenticateJWT
} from '../middleware/auth';
import { ContentBank, ContentEntry } from '../models';
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

export const sourceCreationLimiter = createUserSpecificLimiter(
  5 * 60 * 1000, // 5 minutes
  10 // 10 sources per user
);

// POST route to create a new source
router.post('/', authenticateJWT, sourceCreationLimiter, async function (req: Request<{}, {}, CreateSourceRequest>, res: Response, next: NextFunction) {
  try {
    const { sourceUrl, content, type, pageTitle, bankId } = req.body;
    const user = req.user!; // getUserMiddleware ensures user exists

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

    // Create the source
    const sourceData = {
      user_id: (req.user as any).id,
      content_type: type,
      source_url: sourceUrl,
      content: content,
      type: type,
      page_title: pageTitle,
      bank_id: contentBank.id
    };

    const newSource = await ContentEntry.createEntry(sourceData);

    res.status(201).json({
      id: newSource.id,
      bank_id: newSource.bank_id,
      source_url: newSource.source_url,
      content: newSource.content,
      page_title: newSource.page_title,
      content_type: newSource.content_type,
      created_at: newSource.created_at
    });
  } catch (error) {
    console.error('Error creating source:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;