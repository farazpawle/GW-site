# RBAC Implementation Plan - Step by Step

## 📋 Overview

This document provides a **complete, step-by-step guide** to implement the Role-Based Access Control (RBAC) system. Follow these steps in order to build the system correctly.

**Estimated Time:** 2-3 days (full implementation)  
**Difficulty:** Intermediate  
**Prerequisites:** Basic understanding of Next.js, Prisma, and TypeScript

---

## 🎯 Implementation Phases

```
Phase 1: Database Setup (2-3 hours)
   ↓
Phase 2: Permission System (3-4 hours)
   ↓
Phase 3: Middleware & Guards (2-3 hours)
   ↓
Phase 4: Admin UI (4-6 hours)
   ↓
Phase 5: Testing & Migration (2-3 hours)
```

**Total Time:** 13-19 hours (spread over 2-3 days)

---

## Phase 1: Database Setup (2-3 hours)

### Step 1.1: Update Prisma Schema

**File:** `prisma/schema.prisma`

**What to do:** Add new fields to User model and update UserRole enum.

**Changes:**

1. Update `UserRole` enum (add new roles):
```prisma
enum UserRole {
  SUPER_ADMIN  // New: Highest level (replaces old ADMIN)
  MANAGER      // New: Department manager
  STAFF        // New: Regular staff
  CONTENT_EDITOR // New: Content creator
  VIEWER       // Existing: Read-only (keep as is)
  ADMIN        // Deprecated: Will be migrated to SUPER_ADMIN
}
```

2. Add permissions field to User model:
```prisma
model User {
  id           String        @id
  email        String        @unique
  name         String?
  role         UserRole      @default(VIEWER)
  permissions  String[]      @default([])  // NEW: Array of permission strings
  roleLevel    Int           @default(10)  // NEW: Role hierarchy level
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  activityLogs ActivityLog[]

  @@map("users")
}
```

**Why roleLevel?**
- SUPER_ADMIN = 100
- MANAGER = 50
- STAFF = 20
- CONTENT_EDITOR = 15
- VIEWER = 10

This makes hierarchy comparisons easy: `if (currentUser.roleLevel > targetUser.roleLevel)`

---

### Step 1.2: Create Migration

**Command:**
```bash
npx prisma migrate dev --name add_rbac_system
```

**What this does:**
- Creates database migration
- Adds `permissions` column to users table
- Adds `roleLevel` column to users table
- Updates UserRole enum

**Expected output:**
```
✔ Generated Prisma Client
✔ The migration has been created successfully
```

---

### Step 1.3: Create Data Migration Script

**File:** `scripts/migrate-to-rbac.ts`

**Purpose:** Migrate existing users to new RBAC system

**Code:**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToRBAC() {
  console.log('🔄 Starting RBAC migration...');

  // Step 1: Migrate ADMIN users to SUPER_ADMIN
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });

  console.log(`📊 Found ${adminUsers.length} ADMIN users to migrate`);

  for (const user of adminUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'SUPER_ADMIN',
        roleLevel: 100,
        permissions: [
          'products.*',
          'categories.*',
          'pages.*',
          'menu.*',
          'media.*',
          'users.*',
          'settings.*',
          'analytics.*',
          'messages.*',
          'collections.*'
        ]
      }
    });
    console.log(`✅ Migrated ${user.email} to SUPER_ADMIN`);
  }

  // Step 2: Update VIEWER users
  const viewerUsers = await prisma.user.findMany({
    where: { role: 'VIEWER' }
  });

  console.log(`📊 Found ${viewerUsers.length} VIEWER users to update`);

  for (const user of viewerUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        roleLevel: 10,
        permissions: [
          'products.view',
          'categories.view',
          'pages.view',
          'menu.view',
          'media.view',
          'analytics.view',
          'messages.view',
          'collections.view'
        ]
      }
    });
    console.log(`✅ Updated ${user.email} permissions`);
  }

  console.log('✅ RBAC migration complete!');
}

migrateToRBAC()
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
```

**Run migration:**
```bash
npx tsx scripts/migrate-to-rbac.ts
```

---

## Phase 2: Permission System (3-4 hours)

### Step 2.1: Create Permission Constants

**File:** `src/lib/rbac/permissions.ts`

**Purpose:** Define all permissions and role templates

**Code:**
```typescript
// Permission resource types
export const RESOURCES = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  PAGES: 'pages',
  MENU: 'menu',
  MEDIA: 'media',
  USERS: 'users',
  SETTINGS: 'settings',
  ANALYTICS: 'analytics',
  MESSAGES: 'messages',
  COLLECTIONS: 'collections',
} as const;

// Permission actions
export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  PUBLISH: 'publish',
  UPLOAD: 'upload',
  EXPORT: 'export',
  MANAGE_ROLES: 'manage_roles',
} as const;

// Helper to create permission string
export function createPermission(resource: string, action: string): string {
  return `${resource}.${action}`;
}

// Helper to create wildcard permission
export function createWildcard(resource: string): string {
  return `${resource}.*`;
}

// All possible permissions
export const PERMISSIONS = {
  // Products
  PRODUCTS_VIEW: createPermission(RESOURCES.PRODUCTS, ACTIONS.VIEW),
  PRODUCTS_CREATE: createPermission(RESOURCES.PRODUCTS, ACTIONS.CREATE),
  PRODUCTS_EDIT: createPermission(RESOURCES.PRODUCTS, ACTIONS.EDIT),
  PRODUCTS_DELETE: createPermission(RESOURCES.PRODUCTS, ACTIONS.DELETE),
  PRODUCTS_PUBLISH: createPermission(RESOURCES.PRODUCTS, ACTIONS.PUBLISH),
  PRODUCTS_ALL: createWildcard(RESOURCES.PRODUCTS),

  // Categories
  CATEGORIES_VIEW: createPermission(RESOURCES.CATEGORIES, ACTIONS.VIEW),
  CATEGORIES_CREATE: createPermission(RESOURCES.CATEGORIES, ACTIONS.CREATE),
  CATEGORIES_EDIT: createPermission(RESOURCES.CATEGORIES, ACTIONS.EDIT),
  CATEGORIES_DELETE: createPermission(RESOURCES.CATEGORIES, ACTIONS.DELETE),
  CATEGORIES_ALL: createWildcard(RESOURCES.CATEGORIES),

  // Pages
  PAGES_VIEW: createPermission(RESOURCES.PAGES, ACTIONS.VIEW),
  PAGES_CREATE: createPermission(RESOURCES.PAGES, ACTIONS.CREATE),
  PAGES_EDIT: createPermission(RESOURCES.PAGES, ACTIONS.EDIT),
  PAGES_DELETE: createPermission(RESOURCES.PAGES, ACTIONS.DELETE),
  PAGES_PUBLISH: createPermission(RESOURCES.PAGES, ACTIONS.PUBLISH),
  PAGES_ALL: createWildcard(RESOURCES.PAGES),

  // Menu
  MENU_VIEW: createPermission(RESOURCES.MENU, ACTIONS.VIEW),
  MENU_CREATE: createPermission(RESOURCES.MENU, ACTIONS.CREATE),
  MENU_EDIT: createPermission(RESOURCES.MENU, ACTIONS.EDIT),
  MENU_DELETE: createPermission(RESOURCES.MENU, ACTIONS.DELETE),
  MENU_ALL: createWildcard(RESOURCES.MENU),

  // Media
  MEDIA_VIEW: createPermission(RESOURCES.MEDIA, ACTIONS.VIEW),
  MEDIA_UPLOAD: createPermission(RESOURCES.MEDIA, ACTIONS.UPLOAD),
  MEDIA_DELETE: createPermission(RESOURCES.MEDIA, ACTIONS.DELETE),
  MEDIA_ALL: createWildcard(RESOURCES.MEDIA),

  // Users
  USERS_VIEW: createPermission(RESOURCES.USERS, ACTIONS.VIEW),
  USERS_CREATE: createPermission(RESOURCES.USERS, ACTIONS.CREATE),
  USERS_EDIT: createPermission(RESOURCES.USERS, ACTIONS.EDIT),
  USERS_DELETE: createPermission(RESOURCES.USERS, ACTIONS.DELETE),
  USERS_MANAGE_ROLES: createPermission(RESOURCES.USERS, ACTIONS.MANAGE_ROLES),
  USERS_ALL: createWildcard(RESOURCES.USERS),

  // Settings
  SETTINGS_VIEW: createPermission(RESOURCES.SETTINGS, ACTIONS.VIEW),
  SETTINGS_EDIT: createPermission(RESOURCES.SETTINGS, ACTIONS.EDIT),
  SETTINGS_ALL: createWildcard(RESOURCES.SETTINGS),

  // Analytics
  ANALYTICS_VIEW: createPermission(RESOURCES.ANALYTICS, ACTIONS.VIEW),
  ANALYTICS_EXPORT: createPermission(RESOURCES.ANALYTICS, ACTIONS.EXPORT),
  ANALYTICS_ALL: createWildcard(RESOURCES.ANALYTICS),

  // Messages
  MESSAGES_VIEW: createPermission(RESOURCES.MESSAGES, ACTIONS.VIEW),
  MESSAGES_REPLY: createPermission(RESOURCES.MESSAGES, 'reply'),
  MESSAGES_DELETE: createPermission(RESOURCES.MESSAGES, ACTIONS.DELETE),
  MESSAGES_ALL: createWildcard(RESOURCES.MESSAGES),

  // Collections
  COLLECTIONS_VIEW: createPermission(RESOURCES.COLLECTIONS, ACTIONS.VIEW),
  COLLECTIONS_CREATE: createPermission(RESOURCES.COLLECTIONS, ACTIONS.CREATE),
  COLLECTIONS_EDIT: createPermission(RESOURCES.COLLECTIONS, ACTIONS.EDIT),
  COLLECTIONS_DELETE: createPermission(RESOURCES.COLLECTIONS, ACTIONS.DELETE),
  COLLECTIONS_ALL: createWildcard(RESOURCES.COLLECTIONS),
} as const;

// Role level constants
export const ROLE_LEVELS = {
  SUPER_ADMIN: 100,
  MANAGER: 50,
  STAFF: 20,
  CONTENT_EDITOR: 15,
  VIEWER: 10,
} as const;

// Default permissions for each role
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    PERMISSIONS.PRODUCTS_ALL,
    PERMISSIONS.CATEGORIES_ALL,
    PERMISSIONS.PAGES_ALL,
    PERMISSIONS.MENU_ALL,
    PERMISSIONS.MEDIA_ALL,
    PERMISSIONS.USERS_ALL,
    PERMISSIONS.SETTINGS_ALL,
    PERMISSIONS.ANALYTICS_ALL,
    PERMISSIONS.MESSAGES_ALL,
    PERMISSIONS.COLLECTIONS_ALL,
  ],
  
  MANAGER: [
    PERMISSIONS.PRODUCTS_ALL,
    PERMISSIONS.CATEGORIES_ALL,
    PERMISSIONS.PAGES_ALL,
    PERMISSIONS.MENU_ALL,
    PERMISSIONS.MEDIA_ALL,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    // NOT users.manage_roles - cannot change roles
    PERMISSIONS.ANALYTICS_ALL,
    PERMISSIONS.MESSAGES_ALL,
    PERMISSIONS.COLLECTIONS_ALL,
  ],
  
  STAFF: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.PAGES_VIEW,
    PERMISSIONS.PAGES_EDIT,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_EDIT, // Limited to VIEWER only (enforced in code)
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.MESSAGES_VIEW,
    PERMISSIONS.MESSAGES_REPLY,
  ],
  
  CONTENT_EDITOR: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.PAGES_VIEW,
    PERMISSIONS.PAGES_CREATE,
    PERMISSIONS.PAGES_EDIT,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.MESSAGES_VIEW,
  ],
  
  VIEWER: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.PAGES_VIEW,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.MESSAGES_VIEW,
    PERMISSIONS.COLLECTIONS_VIEW,
  ],
} as const;

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.PRODUCTS_VIEW]: 'View products list and details',
  [PERMISSIONS.PRODUCTS_CREATE]: 'Create new products',
  [PERMISSIONS.PRODUCTS_EDIT]: 'Edit existing products',
  [PERMISSIONS.PRODUCTS_DELETE]: 'Delete products permanently',
  [PERMISSIONS.PRODUCTS_PUBLISH]: 'Publish or unpublish products',
  // Add descriptions for all permissions...
  // (Full list in actual implementation)
} as const;
```

---

### Step 2.2: Create Permission Checker Utility

**File:** `src/lib/rbac/check-permission.ts`

**Purpose:** Check if a user has a specific permission

**Code:**
```typescript
import { User, UserRole } from '@prisma/client';
import { ROLE_LEVELS } from './permissions';

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User, permission: string): boolean {
  // Super Admin bypasses all checks (has all permissions)
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Extract resource and action from permission (e.g., "products.view")
  const [resource, action] = permission.split('.');

  // Check for exact permission match
  if (user.permissions.includes(permission)) {
    return true;
  }

  // Check for wildcard permission (e.g., "products.*")
  const wildcardPermission = `${resource}.*`;
  if (user.permissions.includes(wildcardPermission)) {
    return true;
  }

  return false;
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(user: User, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(user: User, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Check if user can manage another user (based on role hierarchy)
 */
export function canManageUser(currentUser: User, targetUser: User): boolean {
  // Super Admin can manage anyone
  if (currentUser.role === 'SUPER_ADMIN') {
    return true;
  }

  // Cannot manage yourself
  if (currentUser.id === targetUser.id) {
    return false;
  }

  // Can only manage users with lower role level
  return currentUser.roleLevel > targetUser.roleLevel;
}

/**
 * Get user's effective permissions (includes role defaults + custom permissions)
 */
export function getEffectivePermissions(user: User): string[] {
  // Super Admin has all permissions
  if (user.role === 'SUPER_ADMIN') {
    return ['*']; // Represents all permissions
  }

  return user.permissions;
}

/**
 * Get role level number from role enum
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    SUPER_ADMIN: ROLE_LEVELS.SUPER_ADMIN,
    MANAGER: ROLE_LEVELS.MANAGER,
    STAFF: ROLE_LEVELS.STAFF,
    CONTENT_EDITOR: ROLE_LEVELS.CONTENT_EDITOR,
    VIEWER: ROLE_LEVELS.VIEWER,
    ADMIN: ROLE_LEVELS.SUPER_ADMIN, // Legacy support
  };

  return levels[role] || ROLE_LEVELS.VIEWER;
}

/**
 * Check if user has sufficient role level
 */
export function hasMinimumRoleLevel(user: User, minimumLevel: number): boolean {
  return user.roleLevel >= minimumLevel;
}
```

---

### Step 2.3: Create Permission Guard for API Routes

**File:** `src/lib/rbac/guards.ts`

**Purpose:** Easy-to-use guards for protecting API routes

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, hasAnyPermission, hasAllPermissions, canManageUser } from './check-permission';

/**
 * Require specific permission (for API routes)
 * Returns user if authorized, or NextResponse error if not
 */
export async function requirePermission(permission: string) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!hasPermission(user, permission)) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Require ANY of the specified permissions
 */
export async function requireAnyPermission(permissions: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!hasAnyPermission(user, permissions)) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Require ALL of the specified permissions
 */
export async function requireAllPermissions(permissions: string[]) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!hasAllPermissions(user, permissions)) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Check if current user can manage target user
 */
export async function requireCanManageUser(targetUserId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Fetch target user
  const { prisma } = await import('@/lib/prisma');
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId }
  });

  if (!targetUser) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  if (!canManageUser(currentUser, targetUser)) {
    return NextResponse.json(
      { success: false, error: 'Cannot manage user with equal or higher role' },
      { status: 403 }
    );
  }

  return { currentUser, targetUser };
}
```

---

## Phase 3: Middleware & Route Protection (2-3 hours)

### Step 3.1: Update Auth Helper

**File:** `src/lib/auth.ts`

**Update:** Modify existing functions to support RBAC

**Changes:**

1. Update `requireAdmin()` to `requirePermission()`:
```typescript
import { hasPermission, hasAnyPermission } from './rbac/check-permission';

/**
 * Require specific permission to access a page (for Server Components)
 */
export async function requirePermission(permission: string): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=' + encodeURIComponent(window.location.pathname));
  }

  if (!hasPermission(user, permission)) {
    redirect('/admin?error=insufficient_permissions');
  }

  return user;
}

/**
 * Require ANY of the specified permissions
 */
export async function requireAnyPermission(permissions: string[]): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (!hasAnyPermission(user, permissions)) {
    redirect('/admin?error=insufficient_permissions');
  }

  return user;
}

// Keep requireAdmin() for backward compatibility
export async function requireAdmin(): Promise<User> {
  return requireAnyPermission(['users.*', 'settings.*', 'products.*']);
}
```

---

### Step 3.2: Update Middleware

**File:** `src/middleware.ts`

**Update:** Add permission-based route protection

**Changes:**

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac/check-permission';

// Public routes (no auth required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  // ... existing public routes
]);

// Admin route permissions mapping
const ADMIN_ROUTE_PERMISSIONS: Record<string, string> = {
  '/admin/products': 'products.view',
  '/admin/products/new': 'products.create',
  '/admin/categories': 'categories.view',
  '/admin/pages': 'pages.view',
  '/admin/menu-items': 'menu.view',
  '/admin/media': 'media.view',
  '/admin/users': 'users.view',
  '/admin/settings': 'settings.view',
  '/admin/analytics': 'analytics.view',
  '/admin/messages': 'messages.view',
  '/admin/collections': 'collections.view',
};

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes
  if (isPublicRoute(request)) {
    return;
  }

  // Require authentication for all other routes
  await auth.protect();

  // Check permissions for admin routes
  const pathname = request.nextUrl.pathname;
  
  // Find matching admin route
  for (const [route, permission] of Object.entries(ADMIN_ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      const user = await getCurrentUser();
      
      if (!user || !hasPermission(user, permission)) {
        // Redirect to admin dashboard with error
        return Response.redirect(
          new URL('/admin?error=insufficient_permissions', request.url)
        );
      }
      break;
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

---

## Phase 4: Admin UI (4-6 hours)

### Step 4.1: Create Role Management Page

**File:** `src/app/admin/users/[id]/page.tsx`

**Purpose:** Edit user details and manage permissions

**Code:** (Simplified - see full implementation in 05-UI-MOCKUPS.md)

```typescript
import { requirePermission } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/rbac/permissions';
import UserRoleForm from '@/components/admin/users/UserRoleForm';

export default async function EditUserPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Require users.edit permission
  await requirePermission(PERMISSIONS.USERS_EDIT);

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: params.id }
  });

  if (!user) {
    notFound();
  }

  return (
    <div>
      <h1>Edit User: {user.name}</h1>
      <UserRoleForm user={user} />
    </div>
  );
}
```

---

### Step 4.2: Create Permission Management Component

**File:** `src/components/admin/users/PermissionManager.tsx`

**Purpose:** UI for managing user permissions

**Code:**
```typescript
'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import { PERMISSIONS, PERMISSION_DESCRIPTIONS, RESOURCES } from '@/lib/rbac/permissions';

interface PermissionManagerProps {
  user: User;
  currentUser: User;
}

export default function PermissionManager({ user, currentUser }: PermissionManagerProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    user.permissions
  );

  const togglePermission = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    } else {
      setSelectedPermissions(prev => [...prev, permission]);
    }
  };

  const savePermissions = async () => {
    const response = await fetch(`/api/admin/users/${user.id}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: selectedPermissions }),
    });

    if (response.ok) {
      alert('Permissions updated successfully!');
    }
  };

  // Group permissions by resource
  const groupedPermissions = Object.entries(PERMISSIONS).reduce((acc, [key, value]) => {
    const [resource] = value.split('.');
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push({ key, value, description: PERMISSION_DESCRIPTIONS[value] || '' });
    return acc;
  }, {} as Record<string, Array<{ key: string; value: string; description: string }>>);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Manage Permissions</h2>
      
      {Object.entries(groupedPermissions).map(([resource, permissions]) => (
        <div key={resource} className="border rounded-lg p-4">
          <h3 className="font-semibold capitalize mb-2">{resource}</h3>
          
          <div className="space-y-2">
            {permissions.map(({ value, description }) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(value)}
                  onChange={() => togglePermission(value)}
                  className="rounded"
                />
                <span>{value}</span>
                <span className="text-sm text-gray-500">- {description}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={savePermissions}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Permissions
      </button>
    </div>
  );
}
```

---

## Phase 5: API Route Updates (2-3 hours)

### Step 5.1: Update Existing API Routes

**Example:** Update Products API route

**File:** `src/app/api/admin/products/route.ts`

**Before:**
```typescript
export async function POST(req: NextRequest) {
  const user = await checkAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of code
}
```

**After:**
```typescript
import { requirePermission } from '@/lib/rbac/guards';
import { PERMISSIONS } from '@/lib/rbac/permissions';

export async function POST(req: NextRequest) {
  // Check if user has permission
  const userOrError = await requirePermission(PERMISSIONS.PRODUCTS_CREATE);
  
  // If it's an error response, return it
  if (userOrError instanceof NextResponse) {
    return userOrError;
  }
  
  const user = userOrError; // Now we know it's a User object
  
  // ... rest of code
}
```

**Repeat for all admin API routes:**
- `/api/admin/products/*` → Use `PERMISSIONS.PRODUCTS_*`
- `/api/admin/categories/*` → Use `PERMISSIONS.CATEGORIES_*`
- `/api/admin/pages/*` → Use `PERMISSIONS.PAGES_*`
- And so on...

---

### Step 5.2: Create Role Management API

**File:** `src/app/api/admin/users/[id]/role/route.ts`

**Purpose:** API endpoint to change user roles (Super Admin only)

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/rbac/guards';
import { PERMISSIONS, ROLE_LEVELS, ROLE_PERMISSIONS } from '@/lib/rbac/permissions';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Only Super Admins can change roles
  const userOrError = await requirePermission(PERMISSIONS.USERS_MANAGE_ROLES);
  
  if (userOrError instanceof NextResponse) {
    return userOrError;
  }

  const currentUser = userOrError;
  const { role } = await req.json();

  // Validate role
  const validRoles: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'STAFF', 'CONTENT_EDITOR', 'VIEWER'];
  if (!validRoles.includes(role)) {
    return NextResponse.json(
      { error: 'Invalid role' },
      { status: 400 }
    );
  }

  // Cannot change your own role
  if (currentUser.id === params.id) {
    return NextResponse.json(
      { error: 'Cannot change your own role' },
      { status: 403 }
    );
  }

  // Get role level and default permissions
  const roleLevel = ROLE_LEVELS[role as keyof typeof ROLE_LEVELS];
  const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: params.id },
    data: {
      role,
      roleLevel,
      permissions: permissions as string[],
    },
  });

  return NextResponse.json({
    success: true,
    data: updatedUser,
  });
}
```

---

## Phase 6: Testing (2-3 hours)

### Step 6.1: Create Test Users

**Script:** `scripts/create-test-users.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { ROLE_LEVELS, ROLE_PERMISSIONS } from '../src/lib/rbac/permissions';

const prisma = new PrismaClient();

async function createTestUsers() {
  const testUsers = [
    {
      id: 'test_super_admin',
      email: 'super@example.com',
      name: 'Super Admin Test',
      role: 'SUPER_ADMIN',
      roleLevel: ROLE_LEVELS.SUPER_ADMIN,
      permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
    },
    {
      id: 'test_manager',
      email: 'manager@example.com',
      name: 'Manager Test',
      role: 'MANAGER',
      roleLevel: ROLE_LEVELS.MANAGER,
      permissions: ROLE_PERMISSIONS.MANAGER,
    },
    {
      id: 'test_staff',
      email: 'staff@example.com',
      name: 'Staff Test',
      role: 'STAFF',
      roleLevel: ROLE_LEVELS.STAFF,
      permissions: ROLE_PERMISSIONS.STAFF,
    },
    {
      id: 'test_editor',
      email: 'editor@example.com',
      name: 'Content Editor Test',
      role: 'CONTENT_EDITOR',
      roleLevel: ROLE_LEVELS.CONTENT_EDITOR,
      permissions: ROLE_PERMISSIONS.CONTENT_EDITOR,
    },
    {
      id: 'test_viewer',
      email: 'viewer@example.com',
      name: 'Viewer Test',
      role: 'VIEWER',
      roleLevel: ROLE_LEVELS.VIEWER,
      permissions: ROLE_PERMISSIONS.VIEWER,
    },
  ];

  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user as any,
    });
    console.log(`✅ Created test user: ${user.email}`);
  }

  console.log('✅ All test users created!');
}

createTestUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Run:**
```bash
npx tsx scripts/create-test-users.ts
```

---

### Step 6.2: Test Checklist

Test each role systematically:

**Super Admin Tests:**
- ✅ Can access all admin pages
- ✅ Can view, create, edit, delete all resources
- ✅ Can change any user's role
- ✅ Can access settings

**Manager Tests:**
- ✅ Can access most admin pages (except settings)
- ✅ Can manage products, categories, pages, menu
- ✅ Can view users but cannot change roles
- ✅ Can manage Staff, Content Editor, Viewer users
- ❌ Cannot manage other Managers or Super Admins
- ❌ Cannot access settings

**Staff Tests:**
- ✅ Can view and edit products
- ✅ Can view pages and edit them
- ✅ Can upload media
- ✅ Can manage Viewer users only
- ❌ Cannot delete products or categories
- ❌ Cannot create pages
- ❌ Cannot access settings

**Content Editor Tests:**
- ✅ Can create and edit products
- ✅ Can create and edit pages
- ✅ Can upload media
- ❌ Cannot delete anything
- ❌ Cannot manage users
- ❌ Cannot access analytics

**Viewer Tests:**
- ✅ Can view products, categories, pages
- ❌ Cannot edit, create, or delete anything
- ❌ Cannot access user management
- ❌ Cannot access settings

---

## 📊 Implementation Checklist

Use this checklist to track your progress:

### Database & Schema
- [ ] Update Prisma schema with new roles and permissions fields
- [ ] Create database migration
- [ ] Run migration script to update existing users
- [ ] Verify all users have permissions array

### Permission System
- [ ] Create permissions.ts with all permission constants
- [ ] Create check-permission.ts utility
- [ ] Create guards.ts for API route protection
- [ ] Test permission checking logic

### Middleware & Routes
- [ ] Update middleware.ts with permission checks
- [ ] Update auth.ts with new helper functions
- [ ] Test route protection (try accessing without permissions)

### API Updates
- [ ] Update all product API routes
- [ ] Update all category API routes
- [ ] Update all page API routes
- [ ] Update all menu API routes
- [ ] Update all media API routes
- [ ] Update all user API routes
- [ ] Update all settings API routes
- [ ] Create role management API endpoint
- [ ] Create permission management API endpoint

### Admin UI
- [ ] Create user list page with role filters
- [ ] Create user edit page with role selector
- [ ] Create permission management component
- [ ] Add role badges to user listings
- [ ] Update admin navigation (hide pages based on permissions)
- [ ] Add permission-based button visibility

### Testing
- [ ] Create test users for each role
- [ ] Test each role's permissions
- [ ] Test role hierarchy (cannot manage higher roles)
- [ ] Test permission customization
- [ ] Test API route protection
- [ ] Test middleware protection

### Documentation
- [ ] Document new API endpoints
- [ ] Update developer documentation
- [ ] Create user guide for role management
- [ ] Document permission system for future developers

---

## 🚀 Deployment Steps

### Step 1: Pre-deployment Checks
- [ ] All tests passing
- [ ] Database migration tested in staging
- [ ] Backup production database
- [ ] Review all code changes

### Step 2: Deployment
1. Deploy database migration:
   ```bash
   npx prisma migrate deploy
   ```

2. Run RBAC migration script:
   ```bash
   npx tsx scripts/migrate-to-rbac.ts
   ```

3. Deploy application code

4. Verify all existing users have permissions

### Step 3: Post-deployment
- [ ] Test Super Admin access
- [ ] Test that existing functionality still works
- [ ] Monitor for permission errors
- [ ] Communicate role system to team

---

## ⚠️ Common Issues & Solutions

### Issue 1: User has no permissions after migration
**Solution:** Run migration script again:
```bash
npx tsx scripts/migrate-to-rbac.ts
```

### Issue 2: Permission check failing for valid user
**Solution:** Check permission string format (should be `resource.action`)

### Issue 3: Cannot access admin pages after deployment
**Solution:** Verify middleware.ts is checking correct permissions

### Issue 4: Role level not updating
**Solution:** Make sure roleLevel is set when updating role:
```typescript
const roleLevel = ROLE_LEVELS[newRole];
await prisma.user.update({
  where: { id: userId },
  data: { role: newRole, roleLevel }
});
```

---

## 🎓 Summary

**What You Built:**
- ✅ Complete RBAC system with 5 roles
- ✅ 43+ granular permissions
- ✅ Role hierarchy system
- ✅ Permission-based route protection
- ✅ Admin UI for managing roles and permissions
- ✅ Migration path from old system

**Time Investment:** 13-19 hours (2-3 days)

**Result:** Enterprise-grade access control system!

---

**Next Document:** [04-DATABASE-CHANGES.md](./04-DATABASE-CHANGES.md) - Detailed database schema reference
