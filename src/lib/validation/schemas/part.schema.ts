import { z } from 'zod';
import { nameSchema, slugSchema, descriptionSchema, priceSchema, idSchema } from './base.schema';

/**
 * Part/Product validation schemas
 */

// Part number validation (specific format)
export const partNumberSchema = z.string()
  .min(1, 'Part number is required')
  .max(100, 'Part number is too long');

// SKU validation (uppercase letters, numbers, and hyphens only)
export const skuSchema = z.string()
  .min(1, 'SKU is required')
  .max(100, 'SKU is too long')
  .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens');

// Short description validation
export const shortDescSchema = z.string()
  .max(500, 'Short description is too long')
  .optional();

// Stock quantity validation
export const stockQuantitySchema = z.number()
  .int('Stock quantity must be an integer')
  .min(0, 'Stock quantity cannot be negative')
  .optional();

// Part creation schema (full validation for POST)
export const partCreateSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: descriptionSchema,
  shortDesc: shortDescSchema,
  partNumber: partNumberSchema,
  sku: skuSchema,
  price: priceSchema,
  comparePrice: z.number().positive('Compare price must be positive').optional(),
  inStock: z.boolean().default(true),
  stockQuantity: stockQuantitySchema,
  images: z.array(z.string().url('Invalid image URL')).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  compatibility: z.array(z.string()).optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  featured: z.boolean().default(false),
});

// Part update schema (all fields optional except ID)
export const partUpdateSchema = partCreateSchema.partial().extend({
  id: idSchema,
});

// Part filter schema (for GET requests)
export const partFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  featured: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  inStock: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  minPrice: z.string().transform(val => parseFloat(val)).pipe(z.number().positive()).optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).pipe(z.number().positive()).optional(),
  search: z.string().optional(),
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive()).default(1),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().positive().max(100)).default(12),
});

// Part ID parameter validation
export const partIdParamSchema = z.object({
  id: idSchema,
});
