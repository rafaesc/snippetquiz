import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { ContentBank } from '../models';
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

// Rate limiter for content bank operations
export const contentBankLimiter = createUserSpecificLimiter(
  5 * 60 * 1000, // 5 minutes
  20 // 20 operations per user
);

// GET route to retrieve user's content banks
router.get('/', authenticateJWT, async function (req: Request, res: Response, next: NextFunction) {
  try {
    // Fetch user's content banks using the correct method name
    const contentBanks = await ContentBank.findByUserId((req.user as any).id);

    res.status(200).json({
      contentBanks: contentBanks
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
    const user = req.user!;

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

export default router;