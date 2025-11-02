/**
 * Centralized validation schemas export
 * 
 * Import validation schemas from this file:
 * import { partCreateSchema, emailSchema, quoteRequestCreateSchema } from '@/lib/validation';
 */

// Base schemas (common reusable validators)
export * from './schemas/base.schema';

// Part/Product schemas
export * from './schemas/part.schema';

// Quote request schemas
export * from './schemas/quote.schema';

// Contact form schemas
export * from './schemas/contact.schema';
