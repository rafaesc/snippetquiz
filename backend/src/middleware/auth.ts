import { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// JWT Secret keys (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Interfaces
export interface JwtPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Store refresh tokens (in production, use Redis or database)
export const refreshTokens: Set<string> = new Set();

// Cookie extractor function
const cookieExtractor = function(req: Request) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['accessToken'];
  }
  return token;
};

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

      const { password, password_updated_at, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error, false);
    }
  }
));

// Utility functions
export const generateTokens = (user: any) => {
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
export const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
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
export const clearTokenCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

export const verifyRefreshToken = (token: string): Promise<JwtPayload> => {
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