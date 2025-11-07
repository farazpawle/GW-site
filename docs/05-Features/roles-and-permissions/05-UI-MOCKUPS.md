# Admin UI Design & User Flows

## 📋 Overview

This document shows **what the admin interface will look like** and **how users will interact** with the RBAC system. Use this as a visual guide when building the UI.

---

## 🎨 Page Designs

### 1. Users List Page

**Route:** `/admin/users`  
**Permission Required:** `users.view`

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Users Management                                    [+ New User] │
├─────────────────────────────────────────────────────────────────┤
│  Search: [________________]  Role: [All ▼]  [Search]            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Name         Email              Role         Actions     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ John Doe     john@example.com   🔴 Super Admin  [Edit]  │   │
│  │ Sarah Lee    sarah@example.com  🟡 Manager      [Edit]  │   │
│  │ Mike Smith   mike@example.com   🟢 Staff        [Edit]  │   │
│  │ Emma Wilson  emma@example.com   🔵 Content Ed.  [Edit]  │   │
│  │ Alex Brown   alex@example.com   ⚪ Viewer       [Edit]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Showing 5 of 25 users                      [1] 2 3 4 5 [Next>] │
└─────────────────────────────────────────────────────────────────┘
```

**Role Color Coding:**
- 🔴 Red = SUPER_ADMIN
- 🟡 Yellow = MANAGER
- 🟢 Green = STAFF
- 🔵 Blue = CONTENT_EDITOR
- ⚪ White/Gray = VIEWER

**Features:**
- Search by name or email
- Filter by role (dropdown)
- Pagination (20 users per page)
- Quick actions (Edit button)
- Role badges with color coding

---

### 2. Edit User Page

**Route:** `/admin/users/[id]`  
**Permissions Required:** `users.edit` + hierarchy check

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Users              Edit User: Sarah Lee               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Basic Information                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Email:    sarah@example.com                              │   │
│  │ Name:     [Sarah Lee_______________________________]    │   │
│  │ Created:  Jan 15, 2024                                   │   │
│  │ Updated:  Nov 6, 2025                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Role & Permissions                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Current Role: 🟡 Manager                                 │   │
│  │                                                            │   │
│  │ Change Role: [Manager ▼]                                 │   │
│  │              Super Admin                                  │   │
│  │              Manager (current)                            │   │
│  │              Staff                                        │   │
│  │              Content Editor                               │   │
│  │              Viewer                                       │   │
│  │                                                            │   │
│  │ ⚠️  Changing role will reset permissions to defaults     │   │
│  │                                                            │   │
│  │ [Apply Role Template]  [Customize Permissions]           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  [Save Changes]  [Cancel]                                        │
└─────────────────────────────────────────────────────────────────┘
```

**If user clicks "Customize Permissions":**
```
┌─────────────────────────────────────────────────────────────────┐
│  Customize Permissions for Sarah Lee                             │
├─────────────────────────────────────────────────────────────────┤
│  Base Role: Manager  [Reset to Default]                          │
│                                                                   │
│  🔍 Search permissions: [____________]                           │
│                                                                   │
│  ┌─ Products ─────────────────────────────────────────────┐    │
│  │ ☑ products.*  (Grant all product permissions)            │    │
│  │   └─ When checked, all sub-permissions are included      │    │
│  │                                                            │    │
│  │ Or select individual permissions:                         │    │
│  │ ☑ products.view      - View products list and details    │    │
│  │ ☑ products.create    - Create new products               │    │
│  │ ☑ products.edit      - Edit existing products            │    │
│  │ ☑ products.delete    - Delete products permanently       │    │
│  │ ☑ products.publish   - Publish/unpublish products        │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ Categories ───────────────────────────────────────────┐    │
│  │ ☑ categories.*  (Grant all category permissions)         │    │
│  │ ☑ categories.view                                         │    │
│  │ ☑ categories.create                                       │    │
│  │ ☑ categories.edit                                         │    │
│  │ ☑ categories.delete                                       │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ Pages ────────────────────────────────────────────────┐    │
│  │ ☑ pages.view                                              │    │
│  │ ☑ pages.create                                            │    │
│  │ ☑ pages.edit                                              │    │
│  │ ☑ pages.delete                                            │    │
│  │ ☑ pages.publish                                           │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ Users ────────────────────────────────────────────────┐    │
│  │ ☑ users.view         - View user list                    │    │
│  │ ☑ users.create       - Create new users                  │    │
│  │ ☑ users.edit         - Edit user accounts                │    │
│  │ ☑ users.delete       - Delete users                      │    │
│  │ ☐ users.manage_roles - Assign/change user roles          │    │
│  │   ⚠️  Only Super Admins can have this permission         │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  [Expand All] [Collapse All]                                     │
│                                                                   │
│  [Save Permissions]  [Cancel]                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Grouped permissions by resource (collapsible sections)
- Wildcard checkbox grants all sub-permissions
- Descriptions for each permission
- Search/filter permissions
- Visual hierarchy (indented sub-permissions)
- Warnings for restricted permissions

---

### 3. Role Management Matrix (Alternative View)

**Route:** `/admin/users/[id]/permissions-matrix`  
**For Advanced Users**

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Permission Matrix for Sarah Lee (Manager)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Legend: ✅ Granted  ❌ Denied  🔒 Restricted (role requirement) │
│                                                                   │
│  ┌─────────────┬──────┬────────┬──────┬────────┬─────────┐    │
│  │ Resource    │ View │ Create │ Edit │ Delete │ Publish │    │
│  ├─────────────┼──────┼────────┼──────┼────────┼─────────┤    │
│  │ Products    │  ✅  │   ✅   │  ✅  │   ✅   │   ✅    │    │
│  │ Categories  │  ✅  │   ✅   │  ✅  │   ✅   │   N/A   │    │
│  │ Pages       │  ✅  │   ✅   │  ✅  │   ✅   │   ✅    │    │
│  │ Menu        │  ✅  │   ✅   │  ✅  │   ✅   │   N/A   │    │
│  │ Media       │  ✅  │  Upload│  N/A │   ✅   │   N/A   │    │
│  │ Users       │  ✅  │   ✅   │  ✅  │   ✅   │   N/A   │    │
│  │ Settings    │  ❌  │   N/A  │  ❌  │   N/A  │   N/A   │    │
│  │ Analytics   │  ✅  │   N/A  │  N/A │   N/A  │  Export │    │
│  │ Messages    │  ✅  │   N/A  │ Reply│   ✅   │   N/A   │    │
│  │ Collections │  ✅  │   ✅   │  ✅  │   ✅   │   N/A   │    │
│  └─────────────┴──────┴────────┴──────┴────────┴─────────┘    │
│                                                                   │
│  Special Permissions:                                             │
│  🔒 users.manage_roles - Assign/change roles (Super Admin only) │
│                                                                   │
│  [Edit Permissions]  [Export Matrix]                             │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Quick visual overview of all permissions
- Color-coded status (green check, red X)
- Shows restricted permissions
- Exportable (CSV/PDF)
- Click to edit inline

---

### 4. Admin Navigation Menu (Permission-Based)

**What User Sees Depends on Role:**

**Super Admin Sees:**
```
┌─ Admin Menu ────────────┐
│ 📊 Dashboard            │
│ 📦 Products             │
│ 📑 Categories           │
│ 📄 Pages                │
│ 🍔 Menu Items           │
│ 🖼️  Media Library        │
│ 👥 Users ← VISIBLE      │
│ ⚙️  Settings ← VISIBLE  │
│ 📈 Analytics            │
│ 💬 Messages             │
│ 📚 Collections          │
└─────────────────────────┘
```

**Manager Sees:**
```
┌─ Admin Menu ────────────┐
│ 📊 Dashboard            │
│ 📦 Products             │
│ 📑 Categories           │
│ 📄 Pages                │
│ 🍔 Menu Items           │
│ 🖼️  Media Library        │
│ 👥 Users ← VISIBLE      │
│ ⚙️  Settings ← HIDDEN   │ ❌
│ 📈 Analytics            │
│ 💬 Messages             │
│ 📚 Collections          │
└─────────────────────────┘
```

**Staff Sees:**
```
┌─ Admin Menu ────────────┐
│ 📊 Dashboard            │
│ 📦 Products             │
│ 📑 Categories           │
│ 📄 Pages                │
│ 🍔 Menu Items ← HIDDEN  │ ❌
│ 🖼️  Media Library        │
│ 👥 Users ← LIMITED      │ (Can only see Viewers)
│ ⚙️  Settings ← HIDDEN   │ ❌
│ 📈 Analytics            │
│ 💬 Messages             │
│ 📚 Collections ← HIDDEN │ ❌
└─────────────────────────┘
```

**Content Editor Sees:**
```
┌─ Admin Menu ────────────┐
│ 📊 Dashboard            │
│ 📦 Products             │
│ 📑 Categories (View)    │
│ 📄 Pages                │
│ 🍔 Menu Items ← HIDDEN  │ ❌
│ 🖼️  Media Library        │
│ 👥 Users ← HIDDEN       │ ❌
│ ⚙️  Settings ← HIDDEN   │ ❌
│ 📈 Analytics ← HIDDEN   │ ❌
│ 💬 Messages (View)      │
│ 📚 Collections ← HIDDEN │ ❌
└─────────────────────────┘
```

**Viewer Sees:**
```
┌─ Admin Menu ────────────┐
│ 📊 Dashboard            │
│ 📦 Products (View)      │
│ 📑 Categories (View)    │
│ 📄 Pages (View)         │
│ 🍔 Menu Items ← HIDDEN  │ ❌
│ 🖼️  Media Library (View) │
│ 👥 Users ← HIDDEN       │ ❌
│ ⚙️  Settings ← HIDDEN   │ ❌
│ 📈 Analytics (Limited)  │
│ 💬 Messages (View)      │
│ 📚 Collections (View)   │
└─────────────────────────┘
```

---

### 5. Permission-Based Button Visibility

**Products List Page Examples:**

**Super Admin Sees:**
```
┌─────────────────────────────────────────────────────────────┐
│  Products                    [+ New Product] [⚙️ Settings]   │
├─────────────────────────────────────────────────────────────┤
│  Product Name            Actions                             │
│  Engine Part #123        [Edit] [Delete] [Duplicate]        │
│  Transmission Kit        [Edit] [Delete] [Duplicate]        │
└─────────────────────────────────────────────────────────────┘
```

**Manager Sees:**
```
┌─────────────────────────────────────────────────────────────┐
│  Products                    [+ New Product]                 │
├─────────────────────────────────────────────────────────────┤
│  Product Name            Actions                             │
│  Engine Part #123        [Edit] [Delete]                    │
│  Transmission Kit        [Edit] [Delete]                    │
└─────────────────────────────────────────────────────────────┘
```

**Staff Sees:**
```
┌─────────────────────────────────────────────────────────────┐
│  Products                                                    │
├─────────────────────────────────────────────────────────────┤
│  Product Name            Actions                             │
│  Engine Part #123        [Edit]                             │
│  Transmission Kit        [Edit]                             │
└─────────────────────────────────────────────────────────────┘
```

**Content Editor Sees:**
```
┌─────────────────────────────────────────────────────────────┐
│  Products                    [+ New Product]                 │
├─────────────────────────────────────────────────────────────┤
│  Product Name            Actions                             │
│  Engine Part #123        [Edit]                             │
│  Transmission Kit        [Edit]                             │
└─────────────────────────────────────────────────────────────┘
```

**Viewer Sees:**
```
┌─────────────────────────────────────────────────────────────┐
│  Products                                                    │
├─────────────────────────────────────────────────────────────┤
│  Product Name            Actions                             │
│  Engine Part #123        [View]                             │
│  Transmission Kit        [View]                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Flows

### Flow 1: Super Admin Creates a Manager

```
Step 1: Super Admin clicks "Users" in menu
   ↓
Step 2: Clicks "[+ New User]" button
   ↓
Step 3: Enters email: manager@example.com
   ↓
Step 4: Selects role: "Manager" from dropdown
   ↓
Step 5: System auto-assigns Manager permissions
   ↓
Step 6: Super Admin reviews permissions
   ↓
Step 7: (Optional) Customizes permissions
   ↓
Step 8: Clicks "Create User"
   ↓
Step 9: System sends invitation email
   ↓
Step 10: New manager receives email and sets password
```

---

### Flow 2: Manager Tries to Edit Another Manager

```
Step 1: Manager Sarah logs in
   ↓
Step 2: Navigates to "Users" page
   ↓
Step 3: Sees list of users:
        - Super Admins (can see but NOT edit)
        - Other Managers (can see but NOT edit)
        - Staff/Editors/Viewers (CAN edit)
   ↓
Step 4: Clicks "Edit" on another Manager user
   ↓
Step 5: System checks hierarchy:
        - Sarah's level: 50 (Manager)
        - Target's level: 50 (Manager)
        - Result: Sarah.level NOT > Target.level
   ↓
Step 6: System shows error:
        ❌ "You cannot manage users with equal or higher role."
   ↓
Step 7: Sarah can only edit Staff/Editor/Viewer users
```

---

### Flow 3: Content Editor Tries to Delete Product

```
Step 1: Emma (Content Editor) logs in
   ↓
Step 2: Navigates to "Products" page
   ↓
Step 3: Views products list
   ↓
Step 4: Notices NO "Delete" button next to products
        (Button is hidden because she lacks products.delete)
   ↓
Step 5: Emma tries to access delete API directly:
        DELETE /api/admin/products/123
   ↓
Step 6: API checks permission:
        - User: Emma (Content Editor)
        - Required: products.delete
        - Emma's permissions: [products.view, products.create, products.edit]
        - Result: DENIED
   ↓
Step 7: API returns error:
        ❌ 403 Forbidden: "Insufficient permissions"
   ↓
Step 8: Emma sees error message
```

---

### Flow 4: Viewer Tries to Access Settings

```
Step 1: Alex (Viewer) logs in
   ↓
Step 2: Views admin menu
   ↓
Step 3: "Settings" menu item is HIDDEN
        (No settings.view permission)
   ↓
Step 4: Alex tries to type URL directly:
        https://example.com/admin/settings
   ↓
Step 5: Middleware intercepts request
   ↓
Step 6: Middleware checks permission:
        - Required: settings.view
        - Alex's permissions: [products.view, categories.view, ...]
        - Result: NO settings.view permission
   ↓
Step 7: Middleware redirects to:
        /admin?error=insufficient_permissions
   ↓
Step 8: Alex sees error banner:
        ❌ "You don't have permission to access this page."
```

---

## 🎨 Component Examples

### Permission-Based Component (React)

```typescript
// Check permission in component
'use client';

import { useUser } from '@/hooks/useUser';
import { hasPermission } from '@/lib/rbac/check-permission';
import { PERMISSIONS } from '@/lib/rbac/permissions';

export default function ProductActions({ productId }: { productId: string }) {
  const { user } = useUser();

  if (!user) return null;

  const canEdit = hasPermission(user, PERMISSIONS.PRODUCTS_EDIT);
  const canDelete = hasPermission(user, PERMISSIONS.PRODUCTS_DELETE);
  const canPublish = hasPermission(user, PERMISSIONS.PRODUCTS_PUBLISH);

  return (
    <div className="flex gap-2">
      {canEdit && (
        <button className="btn-primary">
          Edit
        </button>
      )}
      
      {canDelete && (
        <button className="btn-danger">
          Delete
        </button>
      )}
      
      {canPublish && (
        <button className="btn-success">
          Publish
        </button>
      )}
      
      {/* View button always visible */}
      <button className="btn-secondary">
        View
      </button>
    </div>
  );
}
```

---

### Permission Gate Component

```typescript
// Wrapper component that shows/hides children based on permission
'use client';

import { useUser } from '@/hooks/useUser';
import { hasPermission, hasAnyPermission } from '@/lib/rbac/check-permission';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  anyPermission?: string[];
  fallback?: React.ReactNode;
}

export function PermissionGate({ 
  children, 
  permission,
  anyPermission,
  fallback = null 
}: PermissionGateProps) {
  const { user } = useUser();

  if (!user) return fallback;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(user, permission);
  } else if (anyPermission) {
    hasAccess = hasAnyPermission(user, anyPermission);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Usage:
<PermissionGate permission="products.delete">
  <button onClick={deleteProduct}>Delete Product</button>
</PermissionGate>
```

---

### Role Badge Component

```typescript
// Display role with color coding
import { UserRole } from '@prisma/client';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
}

const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-red-100 text-red-800 border-red-300',
  MANAGER: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  STAFF: 'bg-green-100 text-green-800 border-green-300',
  CONTENT_EDITOR: 'bg-blue-100 text-blue-800 border-blue-300',
  VIEWER: 'bg-gray-100 text-gray-800 border-gray-300',
  ADMIN: 'bg-red-100 text-red-800 border-red-300', // Deprecated
};

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  MANAGER: 'Manager',
  STAFF: 'Staff',
  CONTENT_EDITOR: 'Content Editor',
  VIEWER: 'Viewer',
  ADMIN: 'Admin (Legacy)',
};

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium border
      ${ROLE_COLORS[role]}
      ${sizeClasses[size]}
    `}>
      {ROLE_LABELS[role]}
    </span>
  );
}

// Usage:
<RoleBadge role={user.role} size="md" />
```

---

## 📱 Mobile Responsive Design

### Users List (Mobile)

```
┌───────────────────────────────┐
│ Users              [+ Add]    │
├───────────────────────────────┤
│ Search: [___________] [Go]    │
│ Role: [All ▼]                 │
├───────────────────────────────┤
│ ┌─────────────────────────┐  │
│ │ John Doe                │  │
│ │ john@example.com        │  │
│ │ 🔴 Super Admin   [Edit] │  │
│ └─────────────────────────┘  │
│                               │
│ ┌─────────────────────────┐  │
│ │ Sarah Lee               │  │
│ │ sarah@example.com       │  │
│ │ 🟡 Manager       [Edit] │  │
│ └─────────────────────────┘  │
│                               │
│ [Load More]                   │
└───────────────────────────────┘
```

**Features:**
- Stacked cards instead of table
- Simplified information
- Touch-friendly buttons
- Infinite scroll or "Load More" button

---

## 🎓 Summary

### UI Components to Build:
1. ✅ Users list page with role filters
2. ✅ User edit page with role selector
3. ✅ Permission customization interface
4. ✅ Permission matrix view (optional)
5. ✅ Role badge component
6. ✅ Permission gate component
7. ✅ Dynamic menu based on permissions

### Key UX Principles:
- **Hide what users can't do** (don't show disabled buttons)
- **Color-code roles** for quick identification
- **Group permissions logically** by resource
- **Provide clear feedback** when access is denied
- **Make hierarchy obvious** (who can manage whom)

### Accessibility:
- Use semantic HTML
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast color scheme

---

**End of Documentation** 🎉

You now have a complete guide to implementing RBAC in your Next.js application!
