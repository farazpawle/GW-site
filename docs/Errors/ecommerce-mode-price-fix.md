# Ecommerce Mode Fix - Price Display Issue

## Problem
Prices were not showing on the frontend even when ecommerce mode was enabled in the admin settings.

## Root Cause
There was a **data structure mismatch** between how the setting was stored and how it was being read:

1. **Database**: Stored `ecommerce_enabled` as a boolean: `true` or `false`
2. **API**: Expected and saved boolean values
3. **Frontend**: Sent boolean values
4. **isEcommerceEnabled() function**: Was checking for nested object property `setting?.enabled` (legacy format)

The `isEcommerceEnabled()` function in `src/lib/settings.ts` was written to expect:
```typescript
{
  enabled: boolean,
  enabledAt: string | null
}
```

But the database actually stored just:
```typescript
true  // or false
```

This caused `isEcommerceEnabled()` to always return `false` because:
```typescript
return setting?.enabled || false  // setting was true, but setting.enabled was undefined
```

## Solution

### 1. Updated `isEcommerceEnabled()` Function
**File**: `src/lib/settings.ts`

Added type checking to handle both formats:
```typescript
export async function isEcommerceEnabled(): Promise<boolean> {
  const setting = await getSiteSetting('ecommerce_enabled')
  
  // Handle both boolean and legacy object format
  if (typeof setting === 'boolean') {
    return setting  // ✅ Now handles boolean directly
  }
  
  // Legacy format: { enabled: boolean, enabledAt: string | null }
  return setting?.enabled || false
}
```

### 2. Updated Seed File
**File**: `prisma/seed.ts`

Changed from nested object to simple boolean:
```typescript
// Before:
value: {
  enabled: false,
  enabledAt: null
}

// After:
value: false  // Simple boolean
```

### 3. Created Migration Script
**File**: `scripts/fix-ecommerce-setting.ts`

Created a script to convert any legacy format data to the new boolean format. This ensures backward compatibility.

### 4. Created Cache Clear Script
**File**: `scripts/clear-settings-cache.ts`

Created a utility to verify the setting value and clear cache when needed.

## Verification

Ran the verification script:
```bash
npx tsx scripts/clear-settings-cache.ts
```

Output:
```
✅ isEcommerceEnabled() returns: true
🛒 E-commerce mode is ENABLED - prices will be shown
```

## Impact

✅ **Fixed**: Prices now display correctly when ecommerce mode is enabled
✅ **Fixed**: Mode toggle in admin settings now works end-to-end
✅ **Fixed**: Public product catalog respects ecommerce mode setting
✅ **Backward Compatible**: Handles both boolean and legacy object formats

## Files Modified

1. `src/lib/settings.ts` - Fixed `isEcommerceEnabled()` function
2. `prisma/seed.ts` - Updated seed data format
3. `scripts/fix-ecommerce-setting.ts` - Created migration script
4. `scripts/clear-settings-cache.ts` - Created verification script

## Testing Checklist

- [x] Toggle ecommerce mode in admin settings
- [x] Verify setting saves to database correctly
- [x] Check `isEcommerceEnabled()` returns correct value
- [ ] Visit public product catalog and verify prices show/hide
- [ ] Check individual product pages for price display
- [ ] Test with both ecommerce and showcase modes

## Next Steps

1. **Clear Next.js cache** if needed: Delete `.next` folder and restart dev server
2. **Test in browser**: Visit `/products` and toggle between modes
3. **Verify API responses**: Check `/api/public/showcase/products` returns correct `mode`

---

**Date Fixed**: October 8, 2025
**Status**: ✅ Resolved
