import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../types/auth.types';
import { ZodError } from 'zod';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      res.status(201).json({ success: true, message: 'User registered successfully', data: result });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      }
      res.status(400).json({ success: false, message: error.message || 'Registration failed', errors: [] });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      res.status(200).json({ success: true, message: 'Login successful', data: result });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
      }
      res.status(401).json({ success: false, message: error.message || 'Login failed', errors: [] });
    }
  }
}

export const authController = new AuthController();
