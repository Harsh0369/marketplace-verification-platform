import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/models';
import { RegisterInput, LoginInput } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfallback';

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await User.findOne({ where: { email: input.email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    
    const user = await User.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Don't return the password
    const userObj = user.toJSON();
    delete userObj.password;

    return { user: userObj, token };
  }

  async login(input: LoginInput) {
    const user = await User.findOne({ where: { email: input.email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    const userObj = user.toJSON();
    delete userObj.password;

    return { user: userObj, token };
  }
}

export const authService = new AuthService();
