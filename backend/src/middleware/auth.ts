import { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { redisService } from '../services/redis';

// JWT Secret keys (should be in environment variables)
const JWT_SECRET = process.env.JWT_AUTH_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_AUTH_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_AUTH_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_AUTH_REFRESH_EXPIRES_IN || '7d';

// Interfaces
export interface JwtPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

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

  // Store refresh token in Redis
  redisService.storeRefreshToken(refreshToken, user.id, JWT_REFRESH_EXPIRES_IN);

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
    maxAge: 365 * 24 * 60 * 60 * 1000 // 365 days in milliseconds
  });
};

// Helper function to clear token cookies
export const clearTokenCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

export const verifyRefreshToken = async (token: string): Promise<JwtPayload> => {
  return new Promise(async (resolve, reject) => {
    try {
      // First check if token exists in Redis
      const userId = await redisService.validateRefreshToken(token);
      if (!userId) {
        return reject(new Error('Invalid refresh token'));
      }

      // Then verify JWT signature
      jwt.verify(token, JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) {
          // Remove invalid token from Redis
          redisService.removeRefreshToken(token);
          return reject(err);
        }
        resolve(decoded as JwtPayload);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Middleware for JWT authentication
export const authenticateJWT = passport.authenticate('jwt', { session: false });