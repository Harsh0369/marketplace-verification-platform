import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import productRoutes from './routes/product.routes';
import authRoutes from './routes/auth.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'ListingShield API is healthy' });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('<h1>ListingShield API is running! 🚀</h1>');
});

import { handleError } from './utils/error.util';

// Basic Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  handleError(res, err);
});

export default app;
