# Admin Authentication Fix

**Date**: October 14, 2025  
**Issue**: Admin page authentication not working correctly in API routes

---

## Problem Identified

The `requireAdmin()` function was using `redirect()` from Next.js, which works in Server Components and Pages but **NOT in API Route Handlers**. This caused the analytics API endpoint to fail.

## Solution Implemented

### 1. Created New Function for API Routes

Added `checkAdmin()` function in `src/lib/auth.ts`:

```typescript
/**
 * Check if current user is admin (for API routes)
 * Returns null if not authenticated or not an admin
 * Use this in API routes where redirect() doesn't work
 * @returns User object if admin, null otherwise
 */
export async function checkAdmin(): Promise<User | null> {
  const user = await getCurrentUser();

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return user;
}
```

### 2. Updated Analytics API Route

Changed `/api/search/analytics/route.ts` to use `checkAdmin()` and return proper 401 response:

```typescript
export async function GET(req: NextRequest) {
  try {
    // Check admin authorization
    const user = await checkAdmin();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    // ... rest of the code
  }
}
```

## Usage Guidelines

### For Server Components & Pages
Use `requireAdmin()` - will redirect to homepage if not admin:
```typescript
export default async function AdminPage() {
  await requireAdmin(); // Redirects non-admin users
  // ... page code
}
```

### For API Routes
Use `checkAdmin()` - returns null if not admin:
```typescript
export async function GET(req: NextRequest) {
  const user = await checkAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... API logic
}
```

## Testing Checklist

- [x] Admin layout still protected with `requireAdmin()`
- [x] Analytics API returns 401 for non-admin users
- [x] Admin users can access dashboard
- [x] Admin users can view analytics
- [x] Non-admin users redirected from `/admin/*` pages
- [x] Non-admin users get 401 from `/api/search/analytics`

## Files Modified

1. `src/lib/auth.ts` - Added `checkAdmin()` function
2. `src/app/api/search/analytics/route.ts` - Updated to use `checkAdmin()`
3. `src/app/(public)/search/page.tsx` - Fixed `endPage` const issue
4. `src/components/admin/analytics/SearchAnalytics.tsx` - Fixed TypeScript `any` type

---

**Status**: ✅ Fixed - Admin authentication now works correctly in both pages and API routes
