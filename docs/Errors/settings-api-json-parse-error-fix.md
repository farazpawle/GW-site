# Fix: Settings API JSON Parsing Error

## Problem
**Error:** `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

This error occurred when the Settings API (`/api/admin/settings`) was accessed without proper authorization (SUPER_ADMIN role).

## Root Cause
The `requireSuperAdmin()` function in `src/lib/admin/auth.ts` was using Next.js `redirect()` for unauthorized users. When called from an API route, this redirect returns an HTML page (the redirect destination) instead of JSON, causing the frontend's `response.json()` to fail with the parsing error.

## Solution
Modified the authorization system to handle API routes differently:

### 1. Updated `requireSuperAdmin()` Function
**File:** `src/lib/admin/auth.ts`

```typescript
export async function requireSuperAdmin(isApiRoute = false): Promise<User> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'SUPER_ADMIN') {
    if (isApiRoute) {
      // Throw error for API routes (caught and converted to JSON)
      throw new Error('Unauthorized: SUPER_ADMIN role required');
    }
    // Redirect for page routes
    redirect('/admin');
  }

  return user;
}
```

### 2. Updated API Routes
**Files:**
- `src/app/api/admin/settings/route.ts` (GET and PUT handlers)
- `src/app/api/admin/settings/[key]/route.ts` (GET and PUT handlers)

**Changes:**
1. Pass `true` flag to `requireSuperAdmin(true)` to enable API mode
2. Added authorization error handling in catch blocks:

```typescript
try {
  await requireSuperAdmin(true); // API route mode
  // ... rest of handler
} catch (error) {
  // Check for authorization error
  if (error instanceof Error && error.message.includes('Unauthorized')) {
    return NextResponse.json(
      { 
        error: 'Unauthorized',
        message: error.message
      },
      { status: 403 }
    );
  }
  // ... other error handling
}
```

## Result
- ✅ API routes now return proper JSON error responses (status 403)
- ✅ Frontend can properly parse error responses
- ✅ No more "Unexpected token '<'" errors
- ✅ Better error messages for debugging

## Testing
To verify the fix works:

1. **Start dev server:** `npm run dev`
2. **Visit settings page without auth:** Navigate to `/admin/settings-v2`
3. **Expected behavior:** 
   - API returns JSON: `{ "error": "Unauthorized", "message": "..." }`
   - Frontend shows error message instead of JSON parsing error

## Files Modified
1. `src/lib/admin/auth.ts` - Added `isApiRoute` parameter
2. `src/app/api/admin/settings/route.ts` - Updated GET/PUT handlers with auth error handling
3. `src/app/api/admin/settings/[key]/route.ts` - Updated GET/PUT handlers with auth error handling
4. `src/app/admin/settings/page.tsx` - Added 403 error handling in fetch/save
5. `src/app/admin/settings-v2/page.tsx` - Added 403 error handling in fetch/save

## Prevention
For future API routes that require authorization:
1. Always pass `true` to `requireSuperAdmin(true)` in API routes
2. Add proper error handling for authorization errors
3. Never use `redirect()` directly in API route handlers
