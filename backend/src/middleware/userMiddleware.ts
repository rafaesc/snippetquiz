import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const getUserMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the sub from the JWT token
    const externalId = (req.auth as any)?.payload?.sub;
    
    if (!externalId) {
      return res.status(401).json({ error: 'No user identifier found in token' });
    }

    // Find user by external_id
    const user = await User.findByExternalId(externalId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in getUserMiddleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};