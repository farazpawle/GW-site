import { z } from 'zod';
import { nameSchema, emailSchema, phoneSchema } from './base.schema';

/**
 * Contact form validation schemas
 */

// Contact message schema
export const contactMessageSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().max(200, 'Subject is too long').optional().or(z.literal('')),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  website: z.string().optional(), // Honeypot field for bot detection
});
