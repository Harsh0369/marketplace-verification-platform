import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfallback';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided', errors: [] });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Malformed token', errors: [] });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { userId: string };
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token', errors: [] });
  }
};
