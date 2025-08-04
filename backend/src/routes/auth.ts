import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '../models/User';
import { ContentBank } from '../models';
import {
  authenticateJWT,
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
  verifyRefreshToken
} from '../middleware/auth';
import { redisService } from '../services/redis';
import { authLimiter, registerLimiter, passwordChangeLimiter } from '../middleware/rateLimiter';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { getVerificationEmailTemplate, getResendVerificationEmailTemplate } from '../services/emailTemplates';

const router = Router();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Email transporter verification error:", process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD, error)
    } else {
        console.log("Email transporter is ready to take messages")
    }
})

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

interface VerifyEmailRequest {
  token: string;
}

// Routes

// Register route with rate limiting and email verification
router.post('/register', registerLimiter, async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
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

    // Create user with verified: false
    const newUser = await User.query().insert({
      name,
      email,
      password,
      verified: false
    });

    // Create a default collection for the new user
    await ContentBank.createBank({
      user_id: newUser.id,
      name: 'Default'
    });

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_AUTH_VERIFICATION_SECRET!,
      { expiresIn: process.env.JWT_AUTH_VERIFICATION_EXPIRES_IN }  as jwt.SignOptions
    );

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
    console.log(process.env.EMAIL_USERNAME)
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Verify Your Email - QuizMaster',
      html: getVerificationEmailTemplate({
        name,
        verificationUrl,
        expiresIn: process.env.JWT_AUTH_VERIFICATION_EXPIRES_IN!
      })
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        verified: newUser.verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email verification route
router.post('/verify-email', async (req: Request<{}, {}, VerifyEmailRequest>, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_AUTH_VERIFICATION_SECRET!) as any;
    
    // Find the user
    const user = await User.query().findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already verified
    if (user.verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Update user verification status
    await User.verifyUser(user.id);

    // Generate tokens for automatic login after verification
    const tokens = generateTokens(user);
    
    // Set tokens in cookies
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: true
      }
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend verification email route
router.post('/resend-verification', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user
    const user = await User.query().where('email', email).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already verified
    if (user.verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_AUTH_VERIFICATION_SECRET!,
      { expiresIn: process.env.JWT_AUTH_VERIFICATION_EXPIRES_IN } as jwt.SignOptions
    );

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Verify Your Email - QuizMaster',
      html: getResendVerificationEmailTemplate({
        name: user.name,
        verificationUrl,
        expiresIn: process.env.JWT_AUTH_VERIFICATION_EXPIRES_IN!
      })
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route with rate limiting
router.post('/login', authLimiter, (req: Request<{}, {}, LoginRequest>, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, async (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Authentication failed' });
    }

    // Check if email is verified
    if (!user.verified) {
      return res.status(401).json({ 
        error: 'Please verify your email before logging in',
        requiresVerification: true
      });
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
        email: user.email,
        verified: user.verified
      }
    });
  })(req, res, next);
});

// Refresh token route with auth rate limiting
router.post('/refresh', authLimiter, async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token using Redis
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Get user from database
    const user = await User.query().findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Remove old refresh token from Redis
    await redisService.removeRefreshToken(refreshToken);

    // Generate new tokens
    const tokens = generateTokens(user);
    
    // Set new tokens in cookies
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout route (no additional rate limiting needed as it's already protected by JWT)
router.post('/logout', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      // Remove refresh token from Redis
      await redisService.removeRefreshToken(refreshToken);
    }
    
    // Clear cookies
    clearTokenCookies(res);
    
    res.json({ message: 'Logged out successfully' });
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

// Change password route with strict rate limiting
router.post('/change-password', passwordChangeLimiter, authenticateJWT, async (req: Request<{}, {}, ChangePasswordRequest>, res: Response) => {
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

      
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      // Remove refresh token from Redis
      await redisService.removeRefreshToken(refreshToken);
    }
    
    // Clear cookies
    clearTokenCookies(res);

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;