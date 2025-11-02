import { z } from 'zod';

/**
 * Shopify-style condition operators
 */
export const conditionOperators = [
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'greater_than',
  'less_than',
  'is_set',
  'is_not_set',
] as const;

/**
 * Available condition fields matching Shopify
 */
export const conditionFields = [
  'product_title',
  'product_type',
  'product_vendor',
  'product_tag',
  'variant_price',
  'variant_compare_at_price',
  'variant_weight',
  'variant_inventory',
] as const;

/**
 * Single condition schema (Shopify-style)
 * Example: { field: 'product_tag', operator: 'equals', value: 'summer' }
 */
export const conditionSchema = z.object({
  field: z.enum(conditionFields),
  operator: z.enum(conditionOperators),
  value: z.string().or(z.number()).optional(), // Optional for is_set/is_not_set operators
});

/**
 * Collection filter rules schema (Shopify-style condition-based)
 * Uses AND/OR logic between conditions
 */
export const collectionFilterRulesSchema = z.object({
  match: z.enum(['all', 'any']), // 'all' = AND logic, 'any' = OR logic
  conditions: z.array(conditionSchema).min(1, 'At least one condition is required'),
}).refine(
  (data) => {
    // Validate that conditions requiring values have them
    return data.conditions.every((condition) => {
      const requiresValue = !['is_set', 'is_not_set'].includes(condition.operator);
      if (requiresValue) {
        return condition.value !== undefined && condition.value !== '';
      }
      return true;
    });
  },
  { message: 'All conditions must have values unless using is_set/is_not_set operators' }
);

/**
 * Validation schema for Collection model (Shopify-style)
 */
export const collectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').max(100),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional().nullable(),
  
  // Collection type: Manual or Smart (automatic)
  collectionType: z.enum(['manual', 'smart']),
  
  // For Smart collections: condition-based rules
  conditions: collectionFilterRulesSchema.nullable().optional(),
  
  // For Manual collections: manually selected product IDs
  manualProductIds: z.array(z.string()).optional().nullable(),
  
  // Display settings
  sortBy: z.enum(['manual', 'best_selling', 'created_desc', 'created_asc', 'price_asc', 'price_desc', 'alpha_asc', 'alpha_desc']).default('manual'),
  
  // SEO
  metaTitle: z.string().max(70, 'Meta title must be 70 characters or less').optional().nullable(),
  metaDescription: z.string().max(320, 'Meta description must be 320 characters or less').optional().nullable(),
  
  // Publishing
  published: z.boolean().default(false),
}).refine(
  (data) => {
    // Manual collections must have products
    if (data.collectionType === 'manual') {
      return data.manualProductIds && data.manualProductIds.length > 0;
    }
    return true;
  },
  { message: 'Manual collections require at least one product' }
).refine(
  (data) => {
    // Smart collections must have conditions
    if (data.collectionType === 'smart') {
      return data.conditions !== null && data.conditions !== undefined;
    }
    return true;
  },
  { message: 'Smart collections require at least one condition' }
);

/**
 * Types for TypeScript
 */
export type ConditionOperator = (typeof conditionOperators)[number];
export type ConditionField = (typeof conditionFields)[number];
export type Condition = z.infer<typeof conditionSchema>;
export type CollectionFilterRules = z.infer<typeof collectionFilterRulesSchema>;
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
