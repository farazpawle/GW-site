import { z } from 'zod';

/**
 * Validation schema for Collection filter rules (JSON field)
 * Supports filtering by categories, brands, tags, origins, difficulties, price range, stock status, featured status
 */
export const collectionFilterRulesSchema = z.object({
  categoryIds: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  origins: z.array(z.string()).optional(),
  difficulties: z.array(z.string()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
}).refine(
  (data) => {
    // At least one filter must be defined
    const hasAnyFilter = 
      (data.categoryIds && data.categoryIds.length > 0) ||
      (data.brands && data.brands.length > 0) ||
      (data.tags && data.tags.length > 0) ||
      (data.origins && data.origins.length > 0) ||
      (data.difficulties && data.difficulties.length > 0) ||
      data.minPrice !== undefined ||
      data.maxPrice !== undefined ||
      data.inStock !== undefined ||
      data.featured !== undefined;
    
    return hasAnyFilter;
  },
  { message: 'At least one filter rule must be defined' }
).refine(
  (data) => {
    // If both price filters exist, minPrice must be less than maxPrice
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice < data.maxPrice;
    }
    return true;
  },
  { message: 'Minimum price must be less than maximum price' }
);

/**
 * Validation schema for Collection model
 */
export const collectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').max(100),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().nullable(),
  filterRules: collectionFilterRulesSchema.nullable().optional(),
  manualProductIds: z.array(z.string()).optional().nullable(),
  useManual: z.boolean(),
  layout: z.enum(['grid', 'list']),
  sortBy: z.enum(['createdAt', 'name', 'price', 'featured']),
  itemsPerPage: z.number().int().min(4, 'Minimum 4 items per page').max(100, 'Maximum 100 items per page'),
  metaTitle: z.string().max(60, 'Meta title must be 60 characters or less').optional().nullable(),
  metaDescription: z.string().max(160, 'Meta description must be 160 characters or less').optional().nullable(),
  published: z.boolean(),
}).refine(
  (data) => {
    // If useManual is true, manualProductIds must be provided
    if (data.useManual) {
      return data.manualProductIds && data.manualProductIds.length > 0;
    }
    return true;
  },
  { message: 'Manual product selection requires at least one product ID' }
).refine(
  (data) => {
    // If useManual is false, filterRules must be provided
    if (!data.useManual) {
      return data.filterRules !== null && data.filterRules !== undefined;
    }
    return true;
  },
  { message: 'Automatic collections require filter rules' }
);

/**
 * Type for Collection form data
 */
export type CollectionFormData = z.infer<typeof collectionSchema>;

/**
 * Helper function to generate URL-friendly slug from collection name
 * @param name - Collection name
 * @returns URL-friendly slug
 */
export function generateCollectionSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}
