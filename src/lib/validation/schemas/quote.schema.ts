import { z } from 'zod';
import { nameSchema, emailSchema, phoneSchema } from './base.schema';

/**
 * Quote request validation schemas
 */

// Quote request product item schema
export const quoteProductSchema = z.object({
  partId: z.string().min(1, 'Part ID is required'),
  partName: z.string().min(1, 'Part name is required'),
  partNumber: z.string().optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().positive('Quantity must be at least 1').default(1),
});

// Quote request creation schema (from customer)
export const quoteRequestCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().max(100, 'Company name is too long').optional(),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters'),
  products: z.array(quoteProductSchema).nullable().optional(),
});

// Quote request update schema (admin actions)
export const quoteRequestUpdateSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'RESPONDED', 'CLOSED']).optional(),
  adminNotes: z.string().max(5000, 'Admin notes must be less than 5000 characters').optional(),
  respondedBy: z.string().optional(),
  respondedAt: z.date().optional(),
});

// Quote request filter schema (for GET requests)
export const quoteRequestFilterSchema = z.object({
  status: z.enum(['pending', 'reviewing', 'quoted', 'accepted', 'rejected', 'completed']).optional(),
  email: emailSchema.optional(),
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()).default(1),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive().max(100)).default(20),
});

// Quote request ID parameter validation
export const quoteRequestIdParamSchema = z.object({
  id: z.string().min(1, 'Quote request ID is required'),
});
