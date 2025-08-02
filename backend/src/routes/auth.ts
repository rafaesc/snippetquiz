import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '../models/User';
import { ContentBank } from '../models';
import {
  authenticateJWT,
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
  verifyRefreshToken,
  refreshTokens,
  JwtPayload
} from '../middleware/auth';

const router = Router();

// Interfaces
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Routes

// Register route
router.post('/register', async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.query().where('email', email).first();
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Create user (you'll need to add password field to your User model)
    const newUser = await User.query().insert({
      name,
      email,
      password
    });

      // Create a default collection for the new user
      await ContentBank.createBank({
        user_id: newUser.id,
        name: 'Default'
      });

    // Generate tokens
    const tokens = generateTokens(newUser);
    
    // Set tokens in cookies
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', (req: Request<{}, {}, LoginRequest>, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Authentication failed' });
    }

    // Generate tokens
    const tokens = generateTokens(user);
    
    // Set tokens in cookies
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  })(req, res, next);
});

// Refresh token route
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Get user from database
    const user = await User.query().findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Remove old refresh token
    refreshTokens.delete(refreshToken);

    // Generate new tokens
    const tokens = generateTokens(user);
    
    // Set new tokens in cookies
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      message: 'Tokens refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout route
router.post('/logout', authenticateJWT, (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }
    
    // Clear token cookies
    clearTokenCookies(res);

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route example
router.get('/profile', authenticateJWT, async (req: Request, res: Response) => {
  // Fetch user's collections using DTO
  const banks = await ContentBank.findByUserId((req.user as any).id);
  
  res.json({
    message: 'Protected route accessed successfully',
    user: req.user,
    banks: banks
  });
});

// Verify token route
router.get('/verify', authenticateJWT, (req: Request, res: Response) => {
  res.json({
    valid: true,
    user: {
      id: (req.user as any).id,
      name: (req.user as any).name,
      email: (req.user as any).email
    }
  });
});

// Change password route
router.post('/change-password', authenticateJWT, async (req: Request<{}, {}, ChangePasswordRequest>, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req.user as any).id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get user from database
    const user = await User.query().findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    await User.query()
      .findById(userId)
      .patch({ password: newPassword });

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;