import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.string().min(2).max(50),
  price: z.number().min(0),
  condition: z.string().min(2).max(50),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  category: z.string().min(2).max(50).optional(),
  price: z.number().min(0).optional(),
  condition: z.string().min(2).max(50).optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
