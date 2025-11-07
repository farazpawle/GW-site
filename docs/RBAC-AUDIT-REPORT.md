# RBAC System Complete Audit & Fix Report

**Date**: November 6, 2025  
**Status**: **CRITICAL SECURITY ISSUES FOUND AND PARTIALLY FIXED**

---

## Executive Summary

### Issues Discovered

1. **Critical Bug in Permission Logic** ✅ FIXED
   - `check-permission.ts` gave ADMIN role unlimited permissions
   - This bypassed the entire custom permissions system
   - **Fix**: Only SUPER_ADMIN now bypasses checks

2. **Missing Permission Fallback** ✅ FIXED
   - When `user.permissions` array was empty, no default permissions were loaded
   - **Fix**: Falls back to `ROLE_PERMISSIONS[user.role]` when array is empty

3. **Incomplete API Protection** ⚠️ IN PROGRESS
   - Out of 64 admin API routes:
     - Only **4 routes** have proper permission checks (6%)
     - **39 routes** use `checkAdmin()` without specific permissions (61%)
     - **12 routes** have NO authentication at all (19%)
   - **Impact**: Users can access features they shouldn't have access to

4. **Missing UI Permission Checks** ⚠️ NOT STARTED
   - Only Homepage CMS component checks permissions
   - All other admin components show buttons/features regardless of permissions
   - **Impact**: Users see options they can't use, leading to errors

---

## What Was Fixed

### 1. Permission Check Logic ✅

**File**: `src/lib/rbac/check-permission.ts`

**Before**:
```typescript
export function hasPermission(user: RBACUser | null, requiredPermission: string): boolean {
  if (!user) return false;
  
  // BUG: ADMIN bypasses all checks!
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return true;
  }
  
  return user.permissions.some((userPerm) => matchesPermission(userPerm, requiredPermission));
}
```

**After**:
```typescript
export function hasPermission(user: RBACUser | null, requiredPermission: string): boolean {
  if (!user) return false;
  
  // ONLY SUPER_ADMIN bypasses all permission checks
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }
  
  // Use default role permissions if custom permissions array is empty
  const userPermissions = user.permissions.length > 0 
    ? user.permissions 
    : ROLE_PERMISSIONS[user.role] || [];
  
  return userPermissions.some((userPerm) => matchesPermission(userPerm, requiredPermission));
}
```

**Impact**: 
- ADMIN, STAFF, CONTENT_EDITOR, VIEWER now respect custom permissions
- Custom permission overrides now work correctly

### 2. Homepage CMS API Routes ✅

**Files**:
- `src/app/api/admin/page-sections/route.ts`
- `src/app/api/admin/page-sections/[id]/route.ts`
- `src/app/api/admin/page-sections/reorder/route.ts`

**Changes**:
- GET requires `homepage.view`
- POST/PUT/DELETE/PATCH require `homepage.edit`
- Return 403 with descriptive error messages

### 3. Homepage CMS UI Component ✅

**File**: `src/components/admin/HomepageCMSManager.tsx`

**Changes**:
- Fetches user permissions from `/api/auth/me`
- Disables edit buttons when user lacks `homepage.edit`
- Shows lock icons on disabled buttons
- Hides "Publish Changes" button for read-only users
- Displays read-only banner

### 4. User Permissions API ✅

**File**: `src/app/api/auth/me/route.ts` (NEW)

**Purpose**: Returns current user with their permissions array

---

## What Still Needs to Be Fixed

### Priority 1: Routes with NO Authentication (12 routes) 🚨

These routes are **publicly accessible** - anyone can call them!

#### Products (4 routes)
- `products/[id]/track-view/route.ts` - Anyone can track views
- `products/[id]/vehicle-compatibility/route.ts` - Public access to compatibility data
- `products/[id]/cross-reference/route.ts` - Public access to cross-references
- `products/[id]/oem-numbers/route.ts` - Public access to OEM numbers

#### Users (5 routes - MOST CRITICAL)
- `users/[userId]/route.ts` - Anyone can view any user's details
- `users/me/route.ts` - Public user info
- `users/[userId]/role/route.ts` - **Anyone can change any user's role!**
- `users/[userId]/permissions/route.ts` - **Anyone can grant themselves permissions!**
- `current-user/route.ts` - Public current user endpoint

#### Settings (2 routes - CRITICAL)
- `settings/route.ts` - Anyone can read/modify ALL site settings
- `settings/[key]/route.ts` - Anyone can read/modify individual settings

#### Pages (1 route)
- `pages/filter-options/route.ts` - Public filter options

### Priority 2: Data Modification Routes (39 routes) ⚠️

These use `checkAdmin()` (any non-VIEWER can access) instead of specific permissions:

#### Products/Parts (28 routes)
- All CRUD operations
- Bulk imports
- OEM numbers, cross-references, vehicle compatibility

#### Categories (2 routes)
- Create, edit, delete categories

#### Media (6 routes)
- Upload, delete files
- Manage buckets

#### Messages (3 routes)
- View, reply, delete messages

### Priority 3: UI Components Need Permission Checks (15+ components) 📋

All admin UI components need permission-based rendering like HomepageCMSManager:

- `src/components/admin/parts/` - Products list/editor
- `src/components/admin/categories/` - Categories list/editor
- `src/components/admin/collections/` - Collections manager
- `src/components/admin/pages/` - Pages manager
- `src/components/admin/menu-items/` - Menu editor
- `src/components/admin/media/` - Media library
- `src/components/admin/users/` - User management
- `src/components/admin/messages/` - Messages dashboard
- `src/components/admin/settings/` - Settings panel

Each needs:
1. Fetch user permissions on mount
2. Disable/hide buttons based on permissions
3. Show lock icons for disabled actions
4. Display permission-denied messages

---

## How to Fix Remaining Routes

### Pattern for API Routes

```typescript
// OLD (Insecure)
import { checkAdmin } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...
}

// NEW (Secure)
import { checkPermission } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const user = await checkPermission('resource.action');
  if (!user) {
    return NextResponse.json(
      { error: 'Forbidden: You do not have permission to perform this action' },
      { status: 403 }
    );
  }
  // ...
}
```

### Permission Mapping

| Resource | View | Create | Edit | Delete | Special |
|----------|------|--------|------|--------|---------|
| products | products.view | products.create | products.edit | products.delete | products.publish |
| categories | categories.view | categories.create | categories.edit | categories.delete | - |
| pages | pages.view | pages.create | pages.edit | pages.delete | pages.publish |
| menu | menu.view | menu.create | menu.edit | menu.delete | - |
| media | media.view | - | - | media.delete | media.upload |
| users | users.view | users.create | users.edit | users.delete | users.manage_roles |
| settings | settings.view | - | settings.edit | - | - |
| analytics | analytics.view | - | - | - | analytics.export |
| messages | messages.view | - | messages.reply | messages.delete | - |
| collections | collections.view | collections.create | collections.edit | collections.delete | - |
| homepage | homepage.view | - | homepage.edit | - | - |
| dashboard | dashboard.view | - | - | - | - |

---

## Testing Procedure

### 1. Test Permission Override System

```bash
# Set user to CONTENT_EDITOR with default permissions
npx tsx scripts/promote-to-admin.ts user@example.com CONTENT_EDITOR

# Remove homepage.edit permission via UI
# 1. Log in as SUPER_ADMIN
# 2. Go to Users > Click user > Edit Permissions
# 3. Uncheck "Edit homepage content and layout"
# 4. Save

# Test as that user
# 1. Log out
# 2. Log in as user@example.com
# 3. Go to /admin/homepage-cms
# 4. Verify buttons are disabled with lock icons
# 5. Try API call - should get 403 Forbidden
```

### 2. Test Role Hierarchy

```bash
# Test that VIEWER cannot access admin features
npx tsx scripts/set-user-to-viewer.ts user@example.com

# Log in and verify:
# - Redirected away from /admin pages
# - API calls return 403
```

### 3. Test SUPER_ADMIN Bypass

```bash
# SUPER_ADMIN should always have access
# Even if you remove their permissions, they bypass all checks
```

---

## Files Modified

### Core RBAC System
- ✅ `src/lib/rbac/check-permission.ts` - Fixed permission logic
- ✅ `src/lib/auth.ts` - Permission helper functions

### API Routes (4/64 = 6% complete)
- ✅ `src/app/api/admin/page-sections/route.ts`
- ✅ `src/app/api/admin/page-sections/[id]/route.ts`
- ✅ `src/app/api/admin/page-sections/reorder/route.ts`
- ✅ `src/app/api/auth/me/route.ts` (NEW)

### UI Components (1/15+ = 7% complete)
- ✅ `src/components/admin/HomepageCMSManager.tsx`

### Testing & Documentation
- ✅ `scripts/test-homepage-permissions.ts` (NEW)
- ✅ `scripts/set-user-to-viewer.ts` (NEW)
- ✅ `scripts/audit-rbac.ts` (NEW)
- ✅ `docs/RBAC-IMPLEMENTATION-GUIDE.md` (NEW)
- ✅ This report

---

## Immediate Action Required

### Critical Security Fixes (Do First)

1. **User Management Routes** (5 routes)
   - These allow privilege escalation - fix immediately!
   - Add `checkPermission('users.manage_roles')` to role changes
   - Add `checkPermission('users.edit')` to permission changes

2. **Settings Routes** (2 routes)
   - Anyone can modify site settings
   - Add `checkPermission('settings.edit')` 

3. **Products Public Routes** (4 routes)
   - Verify if these should be public or need auth

### Next Steps

1. Fix Priority 1 routes (12 routes - NO auth)
2. Fix Priority 2 routes (39 routes - needs specific permissions)
3. Add UI permission checks to all components
4. Update documentation

---

## Current System Status

**Security Level**: ⚠️ **VULNERABLE**

**Completion**: 6% (4/64 routes fixed)

**Recommendation**: 
- Deploy homepage CMS fixes immediately
- Block user/settings routes until fixed
- Schedule full RBAC implementation

---

## Contact

For questions or assistance with RBAC implementation, see:
- `docs/RBAC-IMPLEMENTATION-GUIDE.md` - Detailed implementation guide
- `scripts/audit-rbac.ts` - Audit script to check progress
- Memory bank `activeContext.md` - Updated with RBAC status
