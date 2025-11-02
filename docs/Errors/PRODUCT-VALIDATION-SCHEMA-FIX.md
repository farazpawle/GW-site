# Product Validation Schema Fix

## Issue
**Date**: October 21, 2025  
**Error**: `Unknown argument 'lowStockThreshold'` when updating products

## Root Cause
The validation schema (`shopifyInventoryFieldsSchema`) included fields that don't exist in the Prisma `Part` model:
- `lowStockThreshold`
- `trackInventory`
- `barcode` (in Part model)
- `costPrice`
- `barcode` and `stockQuantity` (in ProductVariant model)

When updating a product, these fields passed Zod validation but failed at the Prisma level because they don't exist in the database schema.

## Schema Mismatch

### Fields in Validation Schema (Before Fix)
```typescript
shopifyInventoryFieldsSchema = {
  sku: string,
  barcode: string,           // ❌ Not in DB
  lowStockThreshold: number, // ❌ Not in DB
  trackInventory: boolean,   // ❌ Not in DB
  hasVariants: boolean,
  compareAtPrice: number,
  costPrice: number,         // ❌ Not in DB
}
```

### Fields in Prisma Part Model
```prisma
model Part {
  // ... other fields ...
  sku                  String
  hasVariants          Boolean  @default(false)
  compareAtPrice       Decimal? @db.Decimal(10, 2)
  stockQuantity        Int      @default(0)
  inStock              Boolean  @default(true)
  // Note: NO barcode, lowStockThreshold, trackInventory, or costPrice
}
```

## Solution Applied

### 1. Updated Validation Schema
**File**: `src/lib/validations/product.ts`

Removed non-existent fields from `shopifyInventoryFieldsSchema`:
```typescript
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
```

### 2. Updated Product Variant Schema
Removed fields that don't exist in the `ProductVariant` Prisma model:
```typescript
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
```

## Files Modified
1. `src/lib/validations/product.ts` - Removed non-existent fields from schemas

## Future Considerations

If you need to add these fields back in the future, you must:

1. **Update Prisma Schema** first:
```prisma
model Part {
  // ... existing fields ...
  
  // Add these fields:
  barcode              String?
  lowStockThreshold    Int      @default(10)
  trackInventory       Boolean  @default(true)
  costPrice            Decimal? @db.Decimal(10, 2)
}
```

2. **Run Prisma Migration**:
```bash
npx prisma migrate dev --name add_inventory_fields
```

3. **Then update validation schema** to include these fields again

## Testing
- ✅ Product creation should work
- ✅ Product updates should work
- ✅ No validation errors for missing fields
- ✅ Form submissions complete successfully

## Related Files
- `src/lib/validations/product.ts` - Validation schemas
- `src/app/api/admin/parts/[id]/route.ts` - Update API endpoint
- `src/components/admin/parts/ProductForm.tsx` - Form component
- `prisma/schema.prisma` - Database schema

## Prevention
**Rule**: Always ensure Zod validation schemas match exactly with Prisma schema fields. Run `npx prisma generate` after schema changes to keep types in sync.
