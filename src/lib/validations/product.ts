import { z } from 'zod';

// Product validation schema for create/update operations
export const productSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name must not exceed 200 characters'),
  
  partNumber: z.string()
    .min(1, 'Part number is required')
    .max(50, 'Part number must not exceed 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'Part number must contain only uppercase letters, numbers, and hyphens'),
  
  description: z.string()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional(),
  
  shortDesc: z.string()
    .max(200, 'Short description must not exceed 200 characters')
    .optional(),
  
  price: z.number()
    .positive('Price must be greater than 0')
    .max(999999.99, 'Price must not exceed 999,999.99'),
  
  comparePrice: z.number()
    .positive('Compare price must be greater than 0')
    .max(999999.99, 'Compare price must not exceed 999,999.99')
    .optional()
    .nullable(),
  
  categoryId: z.string()
    .min(1, 'Category is required'),
  
  stockQuantity: z.number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative'),
  
  inStock: z.boolean(),
  
  images: z.array(z.string().url('Invalid image URL'))
    .max(10, 'Maximum 10 images allowed')
    .optional()
    .default([]), // Images are optional, empty array will automatically get default placeholder on save
  
  specifications: z.record(z.string(), z.any())
    .optional()
    .nullable(),
  
  compatibility: z.array(z.string()),
  
  featured: z.boolean(),
});

// Related products field schema (max 4 similar products)
export const relatedProductsFieldSchema = z.object({
  relatedProductIds: z.array(z.string())
    .max(4, 'Maximum 4 related products allowed')
    .default([]),
});

// Shopify-style inventory fields schema (Phase 5)
// NOTE: Only includes fields that exist in the Prisma schema
// Fields removed (not in DB): barcode, lowStockThreshold, trackInventory, costPrice
export const shopifyInventoryFieldsSchema = z.object({
  sku: z.string()
    .min(1, 'SKU is required')
    .max(100, 'SKU must not exceed 100 characters')
    .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'),
  
  hasVariants: z.boolean()
    .default(false),
  
  compareAtPrice: z.number()
    .positive('Compare at price must be greater than 0')
    .max(999999.99, 'Compare at price must not exceed 999,999.99')
    .optional()
    .nullable(),
});

// Showcase fields schema (Phase 4.5)
export const showcaseFieldsSchema = z.object({
  // Publishing control
  published: z.boolean().default(false),
  
  publishedAt: z.date()
    .nullable()
    .optional(),
  
  showcaseOrder: z.number()
    .int('Showcase order must be a whole number')
    .min(1, 'Showcase order must be at least 1')
    .default(999),
  
  views: z.number()
    .int('Views must be a whole number')
    .min(0, 'Views cannot be negative')
    .default(0),
  
  // Rich metadata
  tags: z.array(z.string())
    .default([]),
  
  brand: z.string()
    .max(100, 'Brand name must not exceed 100 characters')
    .optional()
    .nullable(),
  
  origin: z.string()
    .max(100, 'Origin must not exceed 100 characters')
    .optional()
    .nullable(),
  
  certifications: z.array(z.string())
    .default([]),
  
  warranty: z.string()
    .max(200, 'Warranty must not exceed 200 characters')
    .optional()
    .nullable(),
  
  application: z.array(z.string())
    .default([]),
  
  // Enhanced media (allow empty string or valid URL)
  pdfUrl: z.string()
    .url('Invalid PDF URL')
    .optional()
    .or(z.literal(''))
    .nullable(),
});

// Extended product schema with showcase fields and Shopify inventory fields
export const productSchemaWithShowcase = productSchema
  .merge(showcaseFieldsSchema)
  .merge(shopifyInventoryFieldsSchema)
  .merge(relatedProductsFieldSchema);

// Schema for creating a new product
export const createProductSchema = productSchemaWithShowcase;

// Schema for updating an existing product (all fields optional except id)
export const updateProductSchema = productSchemaWithShowcase.partial().extend({
  id: z.string().min(1, 'Product ID is required'),
});

// Schema for image upload validation
const fileLikeSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().nonnegative('File size must be zero or positive'),
  type: z.string().min(1, 'File type is required'),
}).passthrough();

export const imageUploadSchema = z.object({
  files: z.array(fileLikeSchema)
    .min(1, 'At least one file is required')
    .max(10, 'Maximum 10 files allowed')
    .refine(
      (files) => files.every(file => file.size <= 5 * 1024 * 1024),
      'Each file must be less than 5MB'
    )
    .refine(
      (files) => files.every(file => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)),
      'Only JPG, PNG, and WebP images are allowed'
    ),
});

// Schema for bulk operations
export const bulkOperationSchema = z.object({
  ids: z.array(z.string())
    .min(1, 'At least one product must be selected'),
  
  operation: z.enum(['delete', 'updateStock', 'updateFeatured', 'updatePublished']),
  
  // Optional data for update operations
  data: z.object({
    inStock: z.boolean().optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
  }).optional(),
});

// Product Variant schema (Phase 5 - Shopify-style variants)
// NOTE: Removed barcode field (not in Prisma schema)
export const productVariantSchema = z.object({
  title: z.string()
    .min(1, 'Variant title is required')
    .max(200, 'Variant title must not exceed 200 characters'),
  
  price: z.number()
    .positive('Price must be greater than 0')
    .max(999999.99, 'Price must not exceed 999,999.99')
    .optional()
    .nullable(),
  
  compareAtPrice: z.number()
    .positive('Compare at price must be greater than 0')
    .max(999999.99, 'Compare at price must not exceed 999,999.99')
    .optional()
    .nullable(),
  
  options: z.record(z.string(), z.string())
    .optional()
    .nullable(),
  
  available: z.boolean()
    .default(true),
  
  image: z.string()
    .url('Invalid image URL')
    .optional()
    .nullable(),
  
  position: z.number()
    .int('Position must be a whole number')
    .min(0, 'Position cannot be negative')
    .default(0),
});

// Helper function to generate slug from product name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Type exports for TypeScript inference
export type ProductInput = z.infer<typeof productSchema>;
export type ShowcaseFieldsInput = z.infer<typeof showcaseFieldsSchema>;
export type ShopifyInventoryFieldsInput = z.infer<typeof shopifyInventoryFieldsSchema>;
export type ProductWithShowcaseInput = z.infer<typeof productSchemaWithShowcase>;
export type ProductFormData = ProductWithShowcaseInput; // Export for form components (includes showcase + Shopify inventory)
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
export type BulkOperationInput = z.infer<typeof bulkOperationSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
