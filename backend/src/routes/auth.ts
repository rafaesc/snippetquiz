import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Collection } from '../models/Collection';

const router = Router();

// JWT Secret keys (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

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

interface JwtPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Store refresh tokens (in production, use Redis or database)
const refreshTokens: Set<string> = new Set();

// Passport Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email: string, password: string, done) => {
    try {
      const user = await User.query().where('email', email).first();
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Use the User model's verifyPassword method instead of direct bcrypt.compare
      const isValidPassword = await user.verifyPassword(password);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

const cookieExtractor = function(req: Request) {

    let token = null;
    if (req && req.cookies) {
        token = req.cookies['accessToken']; // 'jwt' is the name of your cookie
    }
    return token;
};

// Passport JWT Strategy
passport.use(new JwtStrategy(
  {
    jwtFromRequest: cookieExtractor,
    secretOrKey: JWT_SECRET
  },
  async (payload: JwtPayload, done) => {
    try {
      const user = await User.query().findById(payload.id);
      if (!user) return done(null, false);

      const { password, password_updated_at, ... userWithoutPassword} = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error, false);
    }
  }
));

// Utility functions
const generateTokens = (user: any) => {
  const payload = {
    id: user.id,
    email: user.email
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);

  // Store refresh token
  refreshTokens.add(refreshToken);

  return { accessToken, refreshToken };
};

// Helper function to set token cookies
const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Set access token cookie (15 minutes)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
  });
  
  // Set refresh token cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
};

// Helper function to clear token cookies
const clearTokenCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

const verifyRefreshToken = (token: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    if (!refreshTokens.has(token)) {
      return reject(new Error('Invalid refresh token'));
    }

    jwt.verify(token, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        refreshTokens.delete(token); // Remove invalid token
        return reject(err);
      }
      resolve(decoded as JwtPayload);
    });
  });
};

// Middleware for JWT authentication
export const authenticateJWT = passport.authenticate('jwt', { session: false });

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
      await Collection.createCollection({
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
  const collections = await Collection.findByUserIdDTO((req.user as any).id);
  
  res.json({
    message: 'Protected route accessed successfully',
    user: req.user,
    collections: collections
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

export default router;