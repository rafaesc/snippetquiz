import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import http from 'http';
import logger from 'morgan';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.load();
import router from './routes';

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', // Your frontend URL
    'http://127.0.0.1:3000'
  ],
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

// Apply CORS middleware before other middleware
app.use(cors(corsOptions));

app.use(logger('dev'));
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const port = process.env.PORT || 3001;

app.use('/', router);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  (err as any).status = 404;
  next(err);
});

// Error handlers
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  res.status((err as any).status || 500);
  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV !== 'production' ? err : {}
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
