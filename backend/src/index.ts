import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import logger from 'morgan';
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';
dotenv.load();

import authRoutes from './routes/auth';
import contentBankRoutes from './routes/content-bank';
import contentEntryRoutes from './routes/content-entry';
import instructionRoutes from './routes/instructions';
import quizRoutes from './routes/quiz';

import router from './routes';
import { redisService } from './services/redis';
import { generalLimiter } from './middleware/rateLimiter';

const app = express();

// CORS configuration based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:4000' // extension
      ]
    : process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : ['https://yourdomain.com'], // fallback if env var not set
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

// Apply CORS middleware before other middleware
app.use(cors(corsOptions));

// Apply general rate limiting to all requests
app.use(generalLimiter);

app.use(logger('dev'));
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '40kb' }));
app.use(cookieParser()); // Add this line to parse cookies

const port = process.env.PORT || 5000;

// Initialize Redis connection
redisService.connect().catch(console.error);

app.use(passport.initialize());

app.use('/', router);

app.use('/api/auth', authRoutes);
app.use('/api/content-bank', contentBankRoutes);
app.use('/api/content-entry', contentEntryRoutes);
app.use('/api/instructions', instructionRoutes);
app.use('/api/quiz', quizRoutes);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  (err as any).status = 404;
  next(err);
});

// Error handlers
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  res.status((err as any).status || 500);
  res.json({
    message: err.message,
    error: process.env.NODE_ENV !== 'production' ? err : {}
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'development') {
    console.log('CORS restricted to localhost only');
  } else {
    console.log('CORS allowed origins:', corsOptions.origin);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  redisService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  redisService.disconnect();
  process.exit(0);
});
