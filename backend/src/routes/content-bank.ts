import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { ContentBank, ContentEntriesBank, ContentEntry, Question, QuestionOption } from '../models';
import { createUserSpecificLimiter } from '../middleware/rateLimiter';

const router = Router();

// Interface for content bank creation request
interface CreateContentBankRequest {
  name: string;
}

// Interface for content bank update request
interface UpdateContentBankRequest {
  name: string;
}

// Interface for content bank duplication request
interface DuplicateContentBankRequest {
  name?: string; // Optional new name, defaults to "Copy of {original_name}"
}

// Rate limiter for content bank operations
export const contentBankLimiter = createUserSpecificLimiter(
  5 * 60 * 1000, // 5 minutes
  20 // 20 operations per user
);

// GET route to retrieve user's content banks with pagination
router.get('/', authenticateJWT, async function (req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 10, name } = req.query;
    const userId = (req.user as any).id;

    // Build query for user's content banks
    let query = ContentBank.query()
      .where('user_id', userId);

    // Add name filter if provided
    if (name && typeof name === 'string') {
      query = query.where('name', 'ilike', `%${name.trim()}%`);
    }

    // Fetch user's content banks with pagination
    const contentBanks = await query
      .orderBy('created_at', 'desc')
      .page(Number(page) - 1, Number(limit));

    res.status(200).json({
      contentBanks: contentBanks.results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: contentBanks.total
      }
    });
  } catch (error) {
    console.error('Error fetching content banks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST route to create a new content bank
router.post('/', authenticateJWT, contentBankLimiter, async function (req: Request<{}, {}, CreateContentBankRequest>, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Content bank name is required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'Content bank name must be 100 characters or less' });
    }

    // Check if user already has a content bank with this name
    const existingBank = await ContentBank.query()
      .where('user_id', (req.user as any).id)
      .where('name', name.trim())
      .first();

    if (existingBank) {
      return res.status(409).json({ error: 'A content bank with this name already exists' });
    }

    // Create the content bank
    const contentBankData = {
      user_id: (req.user as any).id,
      name: name.trim()
    };

    const newContentBank = await ContentBank.createBank(contentBankData);

    res.status(201).json({
      id: newContentBank.id,
      name: newContentBank.name,
      user_id: newContentBank.user_id,
      created_at: newContentBank.created_at,
      updated_at: newContentBank.updated_at
    });
  } catch (error) {
    console.error('Error creating content bank:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT route to update/rename a content bank
router.put('/:id', authenticateJWT, contentBankLimiter, async function (req: Request<{ id: string }, {}, UpdateContentBankRequest>, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const user = req.user!;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Content bank name is required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'Content bank name must be 100 characters or less' });
    }

    // Check if the content bank exists and belongs to the user
    const contentBank = await ContentBank.query()
      .where('id', id)
      .where('user_id', (req.user as any).id)
      .first();

    if (!contentBank) {
      return res.status(404).json({ error: 'Content bank not found or does not belong to user' });
    }

    // Check if user already has another content bank with this name
    const existingBank = await ContentBank.query()
      .where('user_id', (req.user as any).id)
      .where('name', name.trim())
      .whereNot('id', id)
      .first();

    if (existingBank) {
      return res.status(409).json({ error: 'A content bank with this name already exists' });
    }

    // Update the content bank
    const updatedContentBank = await ContentBank.query()
      .patchAndFetchById(id, { name: name.trim() });

    res.status(200).json({
      id: updatedContentBank.id,
      name: updatedContentBank.name,
      user_id: updatedContentBank.user_id,
      created_at: updatedContentBank.created_at,
      updated_at: updatedContentBank.updated_at
    });
  } catch (error) {
    console.error('Error updating content bank:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE route to remove a content bank
router.delete('/:id', authenticateJWT, contentBankLimiter, async function (req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user!;

    // Check if the content bank exists and belongs to the user
    const contentBank = await ContentBank.query()
      .where('id', id)
      .where('user_id', (req.user as any).id)
      .first();

    if (!contentBank) {
      return res.status(404).json({ error: 'Content bank not found or does not belong to user' });
    }

    // Delete the content bank (this should cascade delete related content entries and quizzes)
    await ContentBank.query().deleteById(id);

    res.status(200).json({ message: 'Content bank deleted successfully' });
  } catch (error) {
    console.error('Error deleting content bank:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST route to duplicate a content bank
router.post('/:id/duplicate', authenticateJWT, contentBankLimiter, async function (req: Request<{ id: string }, {}, DuplicateContentBankRequest>, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = (req.user as any).id;

    // Check if the original content bank exists and belongs to the user
    const originalBank = await ContentBank.query()
      .where('id', id)
      .where('user_id', userId)
      .first();

    if (!originalBank) {
      return res.status(404).json({ error: 'Content bank not found or does not belong to user' });
    }

    // Generate new name if not provided
    const newName = name?.trim() || `Copy of ${originalBank.name}`;

    // Validate new name
    if (newName.length > 100) {
      return res.status(400).json({ error: 'Content bank name must be 100 characters or less' });
    }

    // Check if user already has a content bank with this name
    const existingBank = await ContentBank.query()
      .where('user_id', userId)
      .where('name', newName)
      .first();

    if (existingBank) {
      return res.status(409).json({ error: 'A content bank with this name already exists' });
    }

    // Start transaction to ensure data consistency
    const duplicatedBank = await ContentBank.transaction(async (trx) => {
      // Create the new content bank
      const newBank = await ContentBank.query(trx).insert({
        user_id: userId,
        name: newName
      });

      // Get all content entries associated with the original bank
      const contentEntryAssociations = await ContentEntriesBank.query(trx)
        .where('content_bank_id', originalBank.id)
        .withGraphFetched('contentEntry.[questions.options]');

      // Duplicate each content entry and its associations
      for (const association of contentEntryAssociations) {
        if (association.contentEntry) {
          const originalEntry = association.contentEntry;
          
          // Create new content entry (excluding id and created_at)
          const newEntry = await ContentEntry.query(trx).insert({
            content_type: originalEntry.content_type,
            content: originalEntry.content,
            source_url: originalEntry.source_url,
            bucket_object_url: originalEntry.bucket_object_url,
            page_title: originalEntry.page_title,
            prompt_summary: originalEntry.prompt_summary
          });

          // Associate the new content entry with the new bank
          await ContentEntriesBank.query(trx).insert({
            content_entry_id: newEntry.id,
            content_bank_id: newBank.id
          });

          // Duplicate questions and their options
          if (originalEntry.questions) {
            for (const originalQuestion of originalEntry.questions) {
              const newQuestion = await Question.query(trx).insert({
                content: originalQuestion.content,
                source_content_id: newEntry.id
              });

              // Duplicate question options
              if (originalQuestion.options) {
                for (const originalOption of originalQuestion.options) {
                  await QuestionOption.query(trx).insert({
                    question_id: newQuestion.id,
                    option_text: originalOption.option_text,
                    option_explanation: originalOption.option_explanation,
                    is_correct: originalOption.is_correct
                  });
                }
              }
            }
          }
        }
      }

      return newBank;
    });

    res.status(201).json({
      id: duplicatedBank.id,
      name: duplicatedBank.name,
      user_id: duplicatedBank.user_id,
      created_at: duplicatedBank.created_at,
      updated_at: duplicatedBank.updated_at
    });
  } catch (error) {
    console.error('Error duplicating content bank:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;