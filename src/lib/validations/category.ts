import { z } from 'zod';

// Category validation schema for create/update operations
export const categorySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  
  image: z.string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
});

// Schema for creating a new category
export const createCategorySchema = categorySchema;

// Schema for updating an existing category (all fields optional except id)
export const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().min(1, 'Category ID is required'),
});

// Helper function to generate slug from category name
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Type exports for TypeScript inference
export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryFormData = CategoryInput; // Export for form components
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
