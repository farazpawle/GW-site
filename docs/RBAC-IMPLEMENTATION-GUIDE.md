/**
 * RBAC Fixes Implementation Guide
 * 
 * This document lists all API routes that need RBAC permission checks.
 * Priority is based on risk level (data modification > data viewing).
 * 
 * Generated: November 6, 2025
 */

# RBAC Implementation Status

## Critical Issues Found
- **64 total admin API routes**
- **Only 4 routes have proper permission checks** (page-sections)
- **51 routes have security issues**
- **39 routes use checkAdmin() without specific permissions**
- **12 routes have NO authentication at all**

---

## Priority 1: Routes with NO Authentication (CRITICAL)

### Products
- `src/app/api/admin/products/[id]/track-view/route.ts`
- `src/app/api/admin/products/[id]/vehicle-compatibility/route.ts`
- `src/app/api/admin/products/[id]/cross-reference/route.ts`
- `src/app/api/admin/products/[id]/oem-numbers/route.ts`

### Users (VERY CRITICAL - Can expose/modify user data)
- `src/app/api/admin/users/[userId]/route.ts` - Get user details
- `src/app/api/admin/users/me/route.ts` - Get current user
- `src/app/api/admin/users/[userId]/role/route.ts` - Change user role
- `src/app/api/admin/users/[userId]/permissions/route.ts` - Change permissions
- `src/app/api/admin/current-user/route.ts`

### Settings (CRITICAL - Can modify site config)
- `src/app/api/admin/settings/route.ts` - GET, PUT
- `src/app/api/admin/settings/[key]/route.ts` - GET, PUT

### Pages
- `src/app/api/admin/pages/filter-options/route.ts`

---

## Priority 2: Data Modification Routes (HIGH RISK)

### Products (19 routes)
Replace `checkAdmin()` with `checkPermission('products.edit')`:
- `src/app/api/admin/parts/route.ts` - POST
- `src/app/api/admin/parts/[id]/route.ts` - PUT, DELETE
- `src/app/api/admin/parts/bulk/route.ts` - POST
- `src/app/api/admin/parts/[id]/vehicle-compatibility/route.ts` - POST
- `src/app/api/admin/parts/[id]/oem-numbers/route.ts` - POST
- `src/app/api/admin/parts/[id]/cross-references/route.ts` - POST
- All import routes (validate/execute) - POST

### Categories (2 routes)
Replace `checkAdmin()` with:
- `checkPermission('categories.create')` for POST
- `checkPermission('categories.edit')` for PUT
- `checkPermission('categories.delete')` for DELETE

Routes:
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`

### Media (6 routes)
Replace `checkAdmin()` with:
- `checkPermission('media.upload')` for uploads
- `checkPermission('media.delete')` for deletes
- `checkPermission('media.view')` for GET

Routes:
- `src/app/api/admin/upload/route.ts`
- `src/app/api/admin/media/upload/route.ts`
- `src/app/api/admin/media/files/route.ts`
- `src/app/api/admin/media/files/[key]/route.ts`
- `src/app/api/admin/media/buckets/route.ts`
- `src/app/api/admin/media/proxy/route.ts`

### Messages (3 routes)
Replace `checkAdmin()` with:
- `checkPermission('messages.view')` for GET
- `checkPermission('messages.reply')` for PATCH
- `checkPermission('messages.delete')` for DELETE

Routes:
- `src/app/api/admin/messages/route.ts`
- `src/app/api/admin/messages/[id]/route.ts`
- `src/app/api/admin/messages/dashboard/route.ts`

### Users (1 route)
Replace `checkAdmin()` with `checkPermission('users.manage_roles')`:
- `src/app/api/admin/users/bulk-role/route.ts`

---

## Priority 3: Read-only Routes (MEDIUM RISK)

### Products
Replace `checkAdmin()` with `checkPermission('products.view')`:
- `src/app/api/admin/products/template/route.ts`
- `src/app/api/admin/products/top-viewed/route.ts`
- `src/app/api/admin/products/needs-attention/route.ts`
- `src/app/api/admin/products/export/route.ts`

### Collections
Replace `checkAdmin()` with `checkPermission('collections.view')`:
- `src/app/api/admin/collections/preview/route.ts`
- `src/app/api/admin/collections/filter-options/route.ts`

### Analytics
Replace `checkAdmin()` with `checkPermission('analytics.view')`:
- `src/app/api/admin/analytics/engagement/route.ts`

---

## ✅ Already Fixed (Reference Implementation)

### Homepage CMS (3 routes) ✅
- `src/app/api/admin/page-sections/route.ts` - Uses `checkPermission('homepage.view')` for GET, `checkPermission('homepage.edit')` for POST
- `src/app/api/admin/page-sections/[id]/route.ts` - Uses `checkPermission('homepage.edit')` for PUT/DELETE
- `src/app/api/admin/page-sections/reorder/route.ts` - Uses `checkPermission('homepage.edit')`

### Users List (1 route) ✅
- `src/app/api/admin/users/route.ts` - Uses `checkPermission('users.view')`

---

## Implementation Pattern

### Before (Insecure):
```typescript
export async function PUT(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... rest of code
}
```

### After (Secure):
```typescript
import { checkPermission } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const user = await checkPermission('products.edit');
  if (!user) {
    return NextResponse.json(
      { error: 'Forbidden: You do not have permission to edit products' },
      { status: 403 }
    );
  }
  
  // ... rest of code
}
```

### For routes with multiple methods:
```typescript
export async function GET(request: NextRequest) {
  const user = await checkPermission('products.view');
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // ...
}

export async function POST(request: NextRequest) {
  const user = await checkPermission('products.create');
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // ...
}

export async function PUT(request: NextRequest) {
  const user = await checkPermission('products.edit');
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // ...
}

export async function DELETE(request: NextRequest) {
  const user = await checkPermission('products.delete');
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // ...
}
```

---

## Next Steps

1. **Immediate**: Fix Priority 1 routes (no authentication)
2. **Short-term**: Fix Priority 2 routes (data modification)
3. **Medium-term**: Fix Priority 3 routes (read-only)
4. **Long-term**: Add UI permission checks to all admin components

---

## Testing Checklist

For each fixed route:
1. ✅ Log in as SUPER_ADMIN - should work
2. ✅ Log in as user WITH permission - should work
3. ✅ Log in as user WITHOUT permission - should get 403
4. ✅ Check UI hides/disables buttons for users without permission
