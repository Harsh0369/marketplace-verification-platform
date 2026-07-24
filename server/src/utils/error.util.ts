import { Response } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public errors: any[];

  constructor(message: string, statusCode: number, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (res: Response, error: any) => {
  if (error instanceof ZodError) {
    const message = error.issues.map(i => i.message).join(', ');
    return res.status(400).json({
      success: false,
      message: message || 'Validation error',
      errors: error.issues,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }

  // Fallback for unhandled/native errors
  console.error('[Error]:', error);
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message,
    errors: [],
  });
};
