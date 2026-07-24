import { z } from 'zod';

// Regex patterns to detect personal information
const piiPatterns = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i, // Email
  /(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/, // Phone
  /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|facebook\.com|twitter\.com|x\.com|t\.me|wa\.me|snapchat\.com|tiktok\.com|linkedin\.com)\/[a-zA-Z0-9_.-]+/i // Social links
];

const containsPII = (text: string) => piiPatterns.some(pattern => pattern.test(text));

export const createProductSchema = z.object({
  title: z.string().min(3).max(100).refine(val => !containsPII(val), { message: "Title cannot contain personal information (email, phone, social links)" }),
  description: z.string().min(10).max(1000).refine(val => !containsPII(val), { message: "Description cannot contain personal information (email, phone, social links)" }),
  category: z.string().min(2).max(50),
  price: z.number().min(0),
  condition: z.string().min(2).max(50),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  title: z.string().min(3).max(100).optional().refine(val => val === undefined || !containsPII(val), { message: "Title cannot contain personal information" }),
  description: z.string().min(10).max(1000).optional().refine(val => val === undefined || !containsPII(val), { message: "Description cannot contain personal information" }),
  category: z.string().min(2).max(50).optional(),
  price: z.number().min(0).optional(),
  condition: z.string().min(2).max(50).optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
