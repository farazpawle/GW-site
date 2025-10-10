import { z } from "zod";

// Page Group Values Schema (flexible JSON structure for product filtering)
export const pageGroupValuesSchema = z.object({
  // Filter by categories
  categoryIds: z.array(z.string()).optional(),
  
  // Filter by tags
  tags: z.array(z.string()).optional(),
  
  // Filter by collection
  collectionId: z.string().optional(),
  
  // Show all products
  showAll: z.boolean().optional(),
  
  // Additional filters
  brands: z.array(z.string()).optional(),
  origins: z.array(z.string()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
});

// Main Page Schema
export const pageSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens only"),
  description: z.string().optional(),
  groupType: z.enum(["category", "tag", "collection", "all"]),
  groupValues: pageGroupValuesSchema,
  layout: z.enum(["grid", "list"]),
  sortBy: z.enum(["name", "price", "newest"]),
  itemsPerPage: z
    .number()
    .min(4, "Items per page must be at least 4")
    .max(100, "Items per page must be at most 100"),
  metaTitle: z.string().max(60, "Meta title must be 60 characters or less").optional(),
  metaDesc: z.string().max(160, "Meta description must be 160 characters or less").optional(),
  published: z.boolean().optional(),
});

// Create Page Schema (without id, timestamps)
export const createPageSchema = pageSchema;

// Update Page Schema (all fields optional except slug for conflict check)
export const updatePageSchema = pageSchema.partial();

// Type exports
export type PageFormData = z.infer<typeof pageSchema>;
export type PageGroupValues = z.infer<typeof pageGroupValuesSchema>;

/**
 * Generates a URL-friendly slug from a page title
 * @param title - The page title
 * @returns A lowercase slug with hyphens
 * @example
 * generatePageSlug("European Engine Parts") // "european-engine-parts"
 * generatePageSlug("All Products!") // "all-products"
 */
export function generatePageSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Validates if a slug is already in use
 * Helper function for slug uniqueness check
 */
export function isValidSlugFormat(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}
