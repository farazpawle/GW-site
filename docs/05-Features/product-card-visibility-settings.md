# Product Card Field Visibility Settings

## Overview
This feature allows administrators to control which fields appear on product cards throughout the site using a centralized settings panel.

## Features
✅ **11 Configurable Fields**: Control visibility of all product card fields
✅ **Real-time Updates**: Changes apply immediately across all product cards
✅ **Cached for Performance**: Settings cached with 60-second TTL
✅ **Organized UI**: Fields grouped by category (Basic Info, Pricing, Inventory, Additional)
✅ **Visual Feedback**: Eye icon toggles between visible/hidden states

## Configurable Fields

### Basic Information (6 fields)
- **Part Number** - Product part number (e.g., #AP-001)
- **SKU** - Stock keeping unit identifier
- **Brand** - Manufacturer or brand name
- **Origin** - Country of origin
- **Category** - Product category classification
- **Description** - Short product description (2 lines max)

### Pricing (3 fields)
- **Price** - Current selling price
- **Compare Price** - Original price (for showing discounts)
- **Discount Badge** - Percentage off badge (e.g., "-20% OFF")

### Inventory (1 field)
- **Stock Status** - Availability badge (In Stock, Low Stock, Out of Stock)

### Additional (1 field)
- **Tags** - Product tags/labels

## User Guide

### Accessing Settings
1. Navigate to **Admin Panel** → **Settings**
2. Click on the **🎴 Product Card** tab
3. Toggle any field on/off using the switches

### Managing Field Visibility
```
Toggle ON (✅):  Field will appear on all product cards
Toggle OFF (❌): Field will be hidden on all product cards
```

### Saving Changes
1. Make your desired changes
2. Click **"Save Changes"** button
3. Changes apply immediately site-wide

## Technical Implementation

### Architecture
```
┌─────────────────────────────────────────┐
│  Admin Settings UI                      │
│  (ProductCardSettings.tsx)              │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Settings API                           │
│  /api/admin/settings                    │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Database (SiteSettings)                │
│  Key: product_card_display              │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Settings Helper                        │
│  getProductCardSettings()               │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Public API                             │
│  /api/public/product-card-settings      │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  ProductCard Component                  │
│  (Applies settings to UI)               │
└─────────────────────────────────────────┘
```

### Key Files

#### 1. Admin UI Component
**File**: `src/components/admin/settings/ProductCardSettings.tsx`
- Provides toggle switches for all 11 fields
- Grouped by category for better organization
- Eye/EyeOff icons for visual feedback

#### 2. Settings Helper
**File**: `src/lib/settings.ts`
- `getProductCardSettings()` - Fetches settings with defaults
- Returns boolean flags for each field

#### 3. Public API Endpoint
**File**: `src/app/api/public/product-card-settings/route.ts`
- Public endpoint for fetching display settings
- Used by ProductCard component on client side

#### 4. ProductCard Component
**File**: `src/components/public/ProductCard.tsx`
- Fetches settings on mount
- Conditionally renders fields based on settings
- Default: All fields visible (if settings not found)

### Database Schema
```sql
-- SiteSettings table
CREATE TABLE SiteSettings (
  id         TEXT PRIMARY KEY,
  key        TEXT UNIQUE NOT NULL,
  value      JSONB NOT NULL,  -- Stores the field visibility config
  createdAt  TIMESTAMP DEFAULT NOW(),
  updatedAt  TIMESTAMP DEFAULT NOW()
);

-- Example row
{
  "key": "product_card_display",
  "value": {
    "showPartNumber": true,
    "showSku": true,
    "showBrand": true,
    "showOrigin": true,
    "showCategory": true,
    "showDescription": true,
    "showTags": true,
    "showPrice": true,
    "showComparePrice": true,
    "showDiscountBadge": true,
    "showStockStatus": true
  }
}
```

### Caching Strategy
- **Cache Duration**: 60 seconds
- **Cache Key**: `product_card_display`
- **Prefetch**: Included in `prefetchSettings()` for warm cache
- **Invalidation**: Automatic after 60 seconds or manual via cache clear

## Testing

### Manual Testing
1. **Initial State**: All fields visible by default
2. **Hide Price**: 
   - Go to Settings → Product Card
   - Toggle "Price" off
   - Save
   - Verify price disappears from product cards
3. **Hide Multiple**: Toggle off Price, SKU, Description
4. **Show Again**: Toggle them back on and verify they reappear

### API Testing
Run the test script:
```bash
npx tsx scripts/test-product-card-settings.ts
```

### Expected Output
```
🧪 Testing Product Card Settings...

1️⃣ Testing API endpoint...
API Response: {
  "success": true,
  "data": {
    "showPartNumber": true,
    "showSku": true,
    ...
  }
}

2️⃣ Verifying settings structure...
✅ All fields present

3️⃣ Current Configuration:
┌─────────────────────┬────────┐
│ Field               │ Shown  │
├─────────────────────┼────────┤
│ Part Number         │ ✅     │
│ Sku                 │ ✅     │
│ Brand               │ ✅     │
...
└─────────────────────┴────────┘

✅ All tests passed!
```

## Best Practices

### Performance
- Settings are cached for 60 seconds to reduce database load
- ProductCard fetches settings once on mount
- All cards share the same settings (one API call per page load)

### UX Considerations
- **Default All Visible**: Better to start with everything visible
- **Graceful Degradation**: If settings fail to load, show all fields
- **Consistent Layout**: Fixed heights prevent layout shifts when hiding fields

### Maintenance
- Add new fields to both:
  1. `ProductCardSettings.tsx` (UI)
  2. `getProductCardSettings()` (defaults)
  3. `ProductCardSettings` interface in `ProductCard.tsx`
- Update test script when adding fields

## Troubleshooting

### Settings Not Applying
1. Check browser console for API errors
2. Verify settings saved in database:
   ```sql
   SELECT * FROM "SiteSettings" WHERE key = 'product_card_display';
   ```
3. Clear settings cache:
   ```bash
   npx tsx scripts/clear-settings-cache.ts
   ```

### Fields Still Showing When Disabled
1. Hard refresh browser (Ctrl+Shift+R)
2. Check ProductCard component is using latest code
3. Verify API returns correct settings

### All Fields Hidden
1. Go to Settings → Product Card
2. Toggle all fields back on
3. Or manually update database:
   ```sql
   UPDATE "SiteSettings" 
   SET value = '{"showPartNumber":true,"showSku":true,...}'::jsonb
   WHERE key = 'product_card_display';
   ```

## Future Enhancements
- [ ] Bulk actions (Show All / Hide All buttons)
- [ ] Field reordering (drag & drop)
- [ ] Per-page overrides (different settings for different pages)
- [ ] Preview panel showing sample card
- [ ] Settings export/import for quick configuration
- [ ] Role-based field visibility (different for admins vs customers)

## Related Documentation
- [Settings System Overview](../03-Technical-Specs/settings-system.md)
- [Product Card Component](../03-Technical-Specs/product-card.md)
- [Caching Strategy](../03-Technical-Specs/caching.md)
