import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../types/auth.types';
import { sendSuccess } from '../utils/response.util';
import { handleError } from '../utils/error.util';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      return sendSuccess(res, 201, 'User registered successfully', result);
    } catch (error: any) {
      return handleError(res, error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      return sendSuccess(res, 200, 'Login successful', result);
    } catch (error: any) {
      return handleError(res, error);
    }
  }
}

export const authController = new AuthController();
