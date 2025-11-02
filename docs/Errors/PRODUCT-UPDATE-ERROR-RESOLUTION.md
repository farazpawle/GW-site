# Product Update Error Resolution

## Error Fixed
**Date**: October 21, 2025  
**Status**: ✅ RESOLVED

### Original Error
```
Invalid `prisma.part.update()` invocation:

Unknown argument `lowStockThreshold`. Available options are marked with ?.
```

## Root Cause Analysis

### The Problem
The validation schema in `src/lib/validations/product.ts` included several fields that were removed from the Prisma database schema in a previous migration (`20251020131049_add_static_pages_support`):

**Fields in validation schema but NOT in database:**
- `lowStockThreshold`
- `trackInventory`
- `barcode` (Part model)
- `costPrice`

**What was happening:**
1. User fills out product form
2. Form data passes Zod validation (includes removed fields)
3. Data sent to API endpoint
4. API tries to update database with removed fields
5. Prisma rejects update because fields don't exist
6. Error thrown: `Unknown argument 'lowStockThreshold'`

### Migration History
Looking at the migration files, these fields were:
- **Added** in migration `20251008072527_add_phase5_navigation_system`
- **Removed** in migration `20251020131049_add_static_pages_support`

However, the validation schema was never updated to reflect the removal.

## Solution Implemented

### 1. Updated `shopifyInventoryFieldsSchema`
**File**: `src/lib/validations/product.ts`

**Before:**
```typescript
export const shopifyInventoryFieldsSchema = z.object({
  sku: z.string()...
  barcode: z.string()...              // ❌ Removed
  lowStockThreshold: z.number()...    // ❌ Removed
  trackInventory: z.boolean()...      // ❌ Removed
  hasVariants: z.boolean()...
  compareAtPrice: z.number()...
  costPrice: z.number()...            // ❌ Removed
});
```

**After:**
```typescript
export const shopifyInventoryFieldsSchema = z.object({
  sku: z.string()...
  hasVariants: z.boolean()...
  compareAtPrice: z.number()...
});
```

### 2. Updated `productVariantSchema`
Removed `sku`, `barcode`, and `stockQuantity` fields that don't exist in the ProductVariant model.

### 3. Updated `verify-phase5.ts` Script
Removed references to deleted fields in the verification script.

## Current Valid Fields

### Part Model (Inventory Related)
```prisma
model Part {
  sku                  String   @unique
  hasVariants          Boolean  @default(false)
  compareAtPrice       Decimal? @db.Decimal(10, 2)
  stockQuantity        Int      @default(0)
  inStock              Boolean  @default(true)
  // ... other fields
}
```

### ProductVariant Model
```prisma
model ProductVariant {
  title          String
  price          Decimal?
  compareAtPrice Decimal?
  options        Json
  available      Boolean
  image          String?
  position       Int
  // ... other fields
}
```

## Files Modified
1. ✅ `src/lib/validations/product.ts` - Removed non-existent fields
2. ✅ `scripts/verify-phase5.ts` - Updated field references
3. ✅ `docs/Errors/PRODUCT-VALIDATION-SCHEMA-FIX.md` - Detailed documentation

## Testing Checklist
- ✅ Product creation works
- ✅ Product updates work without validation errors
- ✅ Form submission completes successfully
- ✅ No Prisma errors about unknown arguments
- ✅ TypeScript validation schema matches Prisma schema

## Prevention Strategy

### Rule: Keep Validation Schemas in Sync with Prisma Schema

**When modifying Prisma schema:**
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Run `npx prisma generate` to update types
4. **IMPORTANT**: Update `src/lib/validations/product.ts` to match
5. Update any affected API routes
6. Update form components if needed
7. Test create/update operations

### Checklist for Schema Changes
```
[ ] Updated Prisma schema
[ ] Created migration
[ ] Regenerated Prisma Client
[ ] Updated Zod validation schemas
[ ] Updated TypeScript types
[ ] Updated API routes
[ ] Updated form components
[ ] Tested CRUD operations
[ ] Updated documentation
```

## Future Considerations

If you need to add inventory tracking fields back:

### Step 1: Update Prisma Schema
```prisma
model Part {
  // ... existing fields ...
  
  // Inventory tracking fields
  barcode              String?
  lowStockThreshold    Int      @default(10)
  trackInventory       Boolean  @default(true)
  costPrice            Decimal? @db.Decimal(10, 2)
}
```

### Step 2: Run Migration
```bash
npx prisma migrate dev --name add_inventory_tracking_fields
npx prisma generate
```

### Step 3: Update Validation Schema
```typescript
export const shopifyInventoryFieldsSchema = z.object({
  sku: z.string()...,
  barcode: z.string().optional().nullable(),
  lowStockThreshold: z.number().int().min(0).default(10),
  trackInventory: z.boolean().default(true),
  hasVariants: z.boolean().default(false),
  compareAtPrice: z.number().optional().nullable(),
  costPrice: z.number().optional().nullable(),
});
```

### Step 4: Update Forms
Add form fields for the new inventory tracking features.

## Related Issues
- None currently - this was the first occurrence

## Additional Notes
- The product form now correctly matches the database schema
- All inventory-related fields that exist in the database are working
- No data was lost - only validation schema was updated

## References
- Prisma Schema: `prisma/schema.prisma`
- Validation Schema: `src/lib/validations/product.ts`
- Product Form: `src/components/admin/parts/ProductForm.tsx`
- Update API: `src/app/api/admin/parts/[id]/route.ts`
- Migration: `prisma/migrations/20251020131049_add_static_pages_support/migration.sql`
