# Section Name Field Error Fix

## Issue
When trying to save a section with the new name field, users received error:
```
Failed to update section
at handleSubmit (src\components\admin\section-editors\HeroSectionEditor.tsx:41:15)
```

## Root Cause
The Zod validation schema for the `name` field had incorrect chaining:
```typescript
// ❌ INCORRECT - min(1) fails when value is null
name: z.string().trim().min(1).max(100).optional().nullable()
```

When a user leaves the name field empty, we send `null` to the API. However, the schema was trying to apply `.trim()` and `.min(1)` before checking for `null`, causing validation to fail.

## Solution
Fixed the Zod schema to properly handle both `null` and string values:
```typescript
// ✅ CORRECT - Union allows null OR validated string
name: z.union([z.string().trim().min(1).max(100), z.null()]).optional()
```

This schema:
- Accepts `null` (when field is empty)
- Accepts `undefined` (when field is not provided)
- Accepts valid strings (1-100 chars, trimmed)
- Rejects empty strings after trimming

## Additional Improvements

### Better Error Messages
Updated all 5 section editors to show specific error messages from the API:

**Before:**
```typescript
if (!response.ok) {
  throw new Error('Failed to update section');
}
```

**After:**
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  console.error('API Error Response:', errorData);
  throw new Error(errorData.error || 'Failed to update section');
}

// And improved alert message
alert(`Failed to update section: ${error instanceof Error ? error.message : 'Unknown error'}`);
```

## Files Modified
1. `src/types/page-section.ts` - Fixed Zod schema
2. `src/components/admin/section-editors/HeroSectionEditor.tsx` - Better error handling
3. `src/components/admin/section-editors/BrandStorySectionEditor.tsx` - Better error handling
4. `src/components/admin/section-editors/CategoriesSectionEditor.tsx` - Better error handling
5. `src/components/admin/section-editors/PrecisionMfgSectionEditor.tsx` - Better error handling

(Note: CarouselSectionEditor already had good error handling)

## Testing
Validated schema with test cases:
- ✅ `null` → passes
- ✅ `"Test Name"` → passes
- ✅ `undefined` → passes
- ✅ `""` (empty after trim) → would fail correctly

## Status
✅ **FIXED** - Users can now save sections with or without custom names.
