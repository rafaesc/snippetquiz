import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { QuizGenerationInstruction } from '../models';

const router = Router();

// Interface for update request
interface UpdateInstructionRequest {
  instruction: string;
}

// GET route to fetch quiz generation instructions for the authenticated user
router.get('/', authenticateJWT, async function (req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req.user as any).id;

    const instructions = await QuizGenerationInstruction.findByUserId(userId);

    res.json({
      instruction: instructions[0]?.instruction,
      updatedAt: instructions[0]?.updated_at
    });
  } catch (error) {
    console.error('Error fetching quiz generation instructions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT route to update or create quiz generation instruction for the authenticated user
router.put('/', authenticateJWT, async function (req: Request<{}, {}, UpdateInstructionRequest>, res: Response, next: NextFunction) {
  try {
    const userId = (req.user as any).id;
    const { instruction } = req.body;

    if (!instruction || instruction.trim().length === 0) {
      return res.status(400).json({ error: 'Instruction is required and cannot be empty' });
    }

    // Check if user already has an instruction
    const existingInstructions = await QuizGenerationInstruction.findByUserId(userId);

    let result;
    if (existingInstructions.length > 0) {
      // Update existing instruction (assuming one instruction per user)
      result = await QuizGenerationInstruction.query()
        .where('user_id', userId)
        .update({
          instruction: instruction.trim(),
          updated_at: new Date().toISOString()
        })
        .returning('*')
        .first();
    } else {
      // Create new instruction
      result = await QuizGenerationInstruction.createInstruction({
        instruction: instruction.trim(),
        user_id: userId
      });
    }

    res.json({
      instruction: result!.instruction,
      updatedAt: result!.updated_at
    });
  } catch (error) {
    console.error('Error updating quiz generation instruction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;