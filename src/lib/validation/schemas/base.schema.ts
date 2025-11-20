import { z } from 'zod';

/**
 * Common reusable validation schemas
 * Used across multiple API routes to ensure consistency
 */

// Email validation
export const emailSchema = z.string().email('Invalid email format').max(100, 'Email must be less than 100 characters');

// Slug validation (lowercase, numbers, hyphens only)
export const slugSchema = z.string()
  .min(2, 'Slug must be at least 2 characters')
  .max(200, 'Slug must be less than 200 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only');

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(12),
});

// URL validation
export const urlSchema = z.string().url('Invalid URL format').optional();

// Phone number validation (optional, basic format)
export const phoneSchema = z.string()
  .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must be less than 20 characters')
  .optional();

// Name validation (common for user names, product names, etc.)
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .trim();

// Description validation
export const descriptionSchema = z.string()
  .min(10, 'Description must be at least 10 characters')
  .max(5000, 'Description must be less than 5000 characters')
  .trim()
  .optional();

// ID validation (UUID or numeric)
export const idSchema = z.string().min(1, 'ID is required');

// Price validation (positive number with 2 decimal places)
export const priceSchema = z.number()
  .positive('Price must be positive')
  .multipleOf(0.01, 'Price must have at most 2 decimal places');

// Status enum (common statuses)
export const statusSchema = z.enum(['active', 'inactive', 'draft', 'published', 'archived']);

// Boolean with string coercion (for query params)
export const booleanQuerySchema = z.union([
  z.boolean(),
  z.enum(['true', 'false']).transform(val => val === 'true')
]);
