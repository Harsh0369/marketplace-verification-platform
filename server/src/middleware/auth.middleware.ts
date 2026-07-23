import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { handleError, AppError } from '../utils/error.util';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfallback';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return handleError(res, new AppError('Unauthorized: No token provided', 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return handleError(res, new AppError('Unauthorized: Malformed token', 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: string };
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return handleError(res, new AppError('Unauthorized: Invalid token', 401));
  }
};
