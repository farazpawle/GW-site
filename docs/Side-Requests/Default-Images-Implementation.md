# Default Images Implementation

## Overview
Implemented a system-wide default image fallback for products and categories when no image is uploaded.

## Default Image
- **Path**: `/images/GW_LOGO-removebg.png`
- **Used for**: Products and Categories without images

## Implementation Details

### 1. Constants File Created
**File**: `src/lib/constants.ts`
- Centralized default image configuration
- Helper functions for image fallback logic
- Easy to update default images in one place

### 2. Files Updated

#### Admin Panel
1. **Categories List** (`src/app/admin/categories/page.tsx`)
   - Category cards now show logo when no image uploaded
   - Uses `object-contain` with padding for logo display

2. **Products Table** (`src/components/admin/parts/ProductTable.tsx`)
   - Product thumbnails show logo when no images array
   - Smaller logo with background for table display

#### Public Frontend
3. **Products Page** (`src/app/(public)/parts/page.tsx`)
   - Product cards display logo with padding when no image
   - Maintains proper aspect ratio and styling

4. **Products List Page** (`src/app/(public)/products/page.tsx`)
   - Product grid shows logo for items without images
   - Consistent with dark theme design

5. **Product Detail Page** (`src/app/(public)/products/[slug]/page.tsx`)
   - Main product image shows logo as fallback
   - Related products also use logo when needed

## Image Display Logic

### With Image
```tsx
<Image
  src={product.images[0]}
  className="object-cover"
/>
```

### Without Image (Fallback)
```tsx
<Image
  src={product.images?.[0] || '/images/GW_LOGO-removebg.png'}
  className={product.images?.[0] ? 'object-cover' : 'object-contain p-8'}
/>
```

## Benefits
1. ✅ **No Broken Images** - Always shows something meaningful
2. ✅ **Brand Consistency** - Uses company logo as placeholder
3. ✅ **Better UX** - Users see professional branding instead of empty boxes
4. ✅ **Easy Maintenance** - Single file to update for all defaults
5. ✅ **Responsive** - Logo scales properly on all screen sizes

## Future Enhancements
- Consider adding category-specific default images
- Add image optimization for the default logo
- Implement lazy loading for all images including defaults

## Testing Checklist
- [x] Admin categories without images show logo
- [x] Admin products without images show logo
- [x] Public product listings show logo for items without images
- [x] Product detail pages show logo when no image
- [x] Related products use logo as fallback
- [x] Logo displays correctly at different sizes
- [x] Logo maintains aspect ratio and clarity

---
**Date**: October 6, 2025
**Status**: Completed ✅
