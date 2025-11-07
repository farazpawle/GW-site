# Database Schema Changes

## 📋 Overview

This document explains **all database changes** required for the RBAC system. Use this as a reference when implementing or troubleshooting the database layer.

---

## 🗄️ Schema Changes

### 1. UserRole Enum Update

**Current Schema:**
```prisma
enum UserRole {
  ADMIN
  VIEWER
}
```

**New Schema:**
```prisma
enum UserRole {
  SUPER_ADMIN     // NEW: Replaces ADMIN (highest level)
  MANAGER         // NEW: Department/team manager
  STAFF           // NEW: Regular employee
  CONTENT_EDITOR  // NEW: Content creator
  VIEWER          // EXISTING: Read-only user (unchanged)
  ADMIN           // DEPRECATED: Keep temporarily for migration
}
```

**Why keep ADMIN?**
- Allows gradual migration without breaking existing users
- Will be removed after migration is complete
- All ADMIN users will be migrated to SUPER_ADMIN

---

### 2. User Model Update

**Current Schema:**
```prisma
model User {
  id           String        @id
  email        String        @unique
  name         String?
  role         UserRole      @default(VIEWER)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  activityLogs ActivityLog[]

  @@map("users")
}
```

**New Schema:**
```prisma
model User {
  id           String        @id
  email        String        @unique
  name         String?
  role         UserRole      @default(VIEWER)
  permissions  String[]      @default([])       // NEW: Array of permission strings
  roleLevel    Int           @default(10)       // NEW: Hierarchy level (10-100)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  activityLogs ActivityLog[]

  @@index([role])           // NEW: Index for role queries
  @@index([roleLevel])      // NEW: Index for hierarchy queries
  @@map("users")
}
```

**New Fields Explained:**

#### `permissions` (String[])
- **Type:** Array of strings
- **Default:** Empty array `[]`
- **Purpose:** Stores user's permission strings
- **Example Values:**
  ```json
  [
    "products.view",
    "products.edit",
    "categories.view",
    "media.upload"
  ]
  ```
- **Wildcard Support:**
  ```json
  [
    "products.*",  // All product permissions
    "categories.*" // All category permissions
  ]
  ```

#### `roleLevel` (Int)
- **Type:** Integer
- **Default:** 10 (VIEWER level)
- **Purpose:** Determines user's position in role hierarchy
- **Values:**
  - `100` = SUPER_ADMIN (highest)
  - `50` = MANAGER
  - `20` = STAFF
  - `15` = CONTENT_EDITOR
  - `10` = VIEWER (lowest)

**Why use roleLevel?**
- Makes hierarchy comparisons simple: `if (user1.roleLevel > user2.roleLevel)`
- Allows easy addition of roles in between (e.g., "Senior Staff" = 25)
- Fast database queries: `WHERE roleLevel >= 50`

---

## 📊 Database Migration

### Migration File

**Generated file:** `prisma/migrations/YYYYMMDD_add_rbac_system/migration.sql`

**SQL Content:**
```sql
-- AlterEnum: Add new roles to UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MANAGER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STAFF';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CONTENT_EDITOR';

-- AlterTable: Add new columns to users table
ALTER TABLE "users" ADD COLUMN "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "users" ADD COLUMN "roleLevel" INTEGER DEFAULT 10;

-- CreateIndex: Add indexes for better query performance
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_roleLevel_idx" ON "users"("roleLevel");

-- Update existing users
UPDATE "users" 
SET "roleLevel" = 100, 
    "permissions" = ARRAY[
      'products.*', 'categories.*', 'pages.*', 'menu.*', 
      'media.*', 'users.*', 'settings.*', 'analytics.*', 
      'messages.*', 'collections.*'
    ]
WHERE "role" = 'ADMIN';

UPDATE "users" 
SET "roleLevel" = 10,
    "permissions" = ARRAY[
      'products.view', 'categories.view', 'pages.view', 
      'menu.view', 'media.view', 'analytics.view', 
      'messages.view', 'collections.view'
    ]
WHERE "role" = 'VIEWER';
```

**Run migration:**
```bash
npx prisma migrate dev --name add_rbac_system
```

---

## 🔄 Data Migration Script

### Purpose
Migrate existing users to new RBAC system with proper permissions.

### Script Location
`scripts/migrate-to-rbac.ts`

### What It Does

1. **Finds all ADMIN users**
   - Changes their role to SUPER_ADMIN
   - Sets roleLevel to 100
   - Assigns all permissions (wildcards)

2. **Updates all VIEWER users**
   - Keeps role as VIEWER
   - Sets roleLevel to 10
   - Assigns view-only permissions

3. **Logs all changes**
   - Shows which users were migrated
   - Reports success/failure for each user

### Example Output:
```
🔄 Starting RBAC migration...
📊 Found 2 ADMIN users to migrate
✅ Migrated john@example.com to SUPER_ADMIN
✅ Migrated sarah@example.com to SUPER_ADMIN
📊 Found 5 VIEWER users to update
✅ Updated alex@example.com permissions
✅ Updated emma@example.com permissions
✅ Updated mike@example.com permissions
✅ Updated lisa@example.com permissions
✅ Updated tom@example.com permissions
✅ RBAC migration complete!
```

---

## 📈 Database Indexes

### New Indexes Added

**1. Role Index**
```sql
CREATE INDEX "users_role_idx" ON "users"("role");
```
**Purpose:** Speed up queries filtering by role
**Example Query:**
```typescript
const managers = await prisma.user.findMany({
  where: { role: 'MANAGER' } // Uses index
});
```

**2. Role Level Index**
```sql
CREATE INDEX "users_roleLevel_idx" ON "users"("roleLevel");
```
**Purpose:** Speed up hierarchy queries
**Example Query:**
```typescript
const seniorUsers = await prisma.user.findMany({
  where: { roleLevel: { gte: 50 } } // Uses index
});
```

---

## 🔍 Example Queries

### Query 1: Get All Managers and Above
```typescript
const seniorUsers = await prisma.user.findMany({
  where: {
    roleLevel: {
      gte: 50 // Greater than or equal to Manager level
    }
  },
  orderBy: {
    roleLevel: 'desc' // Highest first
  }
});
```

### Query 2: Get Users with Specific Permission
```typescript
const usersWhoCanDeleteProducts = await prisma.user.findMany({
  where: {
    OR: [
      { permissions: { has: 'products.delete' } }, // Exact permission
      { permissions: { has: 'products.*' } },      // Wildcard permission
    ]
  }
});
```

### Query 3: Get Users Below Certain Role Level
```typescript
const juniorUsers = await prisma.user.findMany({
  where: {
    roleLevel: {
      lt: 50 // Less than Manager level
    }
  }
});
```

### Query 4: Count Users by Role
```typescript
const roleCounts = await prisma.user.groupBy({
  by: ['role'],
  _count: {
    id: true
  }
});

// Result:
// [
//   { role: 'SUPER_ADMIN', _count: { id: 2 } },
//   { role: 'MANAGER', _count: { id: 5 } },
//   { role: 'STAFF', _count: { id: 10 } },
//   { role: 'CONTENT_EDITOR', _count: { id: 3 } },
//   { role: 'VIEWER', _count: { id: 15 } }
// ]
```

---

## 🎯 Permission Storage Format

### How Permissions are Stored

Permissions are stored as a PostgreSQL **text array** (`TEXT[]`).

**Database Value:**
```
{products.view,products.edit,categories.view,media.upload}
```

**Prisma Representation:**
```typescript
user.permissions: string[]
// Example:
// ['products.view', 'products.edit', 'categories.view', 'media.upload']
```

### Wildcard Permissions

**Example: User has `products.*`**
```typescript
user.permissions = ['products.*', 'categories.view'];

// This grants:
// - products.view
// - products.create
// - products.edit
// - products.delete
// - products.publish
// - categories.view
```

### Checking Permissions in Database

**Using Prisma:**
```typescript
// Check if user has specific permission
const user = await prisma.user.findFirst({
  where: {
    id: userId,
    OR: [
      { permissions: { has: 'products.edit' } },
      { permissions: { has: 'products.*' } }
    ]
  }
});

if (user) {
  console.log('User has products.edit permission');
}
```

**Using Raw SQL:**
```sql
-- Check if user has permission
SELECT * FROM users
WHERE id = 'user_123'
AND (
  'products.edit' = ANY(permissions)
  OR 'products.*' = ANY(permissions)
);
```

---

## 🔐 Role Level Hierarchy

### Database Values

| Role | roleLevel | Description |
|------|-----------|-------------|
| SUPER_ADMIN | 100 | Full system access |
| MANAGER | 50 | Department manager |
| STAFF | 20 | Regular employee |
| CONTENT_EDITOR | 15 | Content creator |
| VIEWER | 10 | Read-only access |

### Why These Numbers?

**Gaps allow for future roles:**
- Can add "Senior Manager" at level 75
- Can add "Junior Staff" at level 15
- Can add "Senior Content Editor" at level 18
- Flexible hierarchy without schema changes

### Comparison Queries

**Find users who can manage a specific user:**
```typescript
const targetUser = await prisma.user.findUnique({ 
  where: { id: 'target_user_id' } 
});

const managersOfTarget = await prisma.user.findMany({
  where: {
    roleLevel: {
      gt: targetUser.roleLevel // Greater than target's level
    }
  }
});
```

**Find users a manager can manage:**
```typescript
const manager = await prisma.user.findUnique({ 
  where: { id: 'manager_id' } 
});

const manageableUsers = await prisma.user.findMany({
  where: {
    roleLevel: {
      lt: manager.roleLevel, // Less than manager's level
    },
    id: {
      not: manager.id // Exclude self
    }
  }
});
```

---

## 📊 Data Integrity Rules

### Rule 1: Role and RoleLevel Must Match

**Validation:**
```typescript
const ROLE_LEVEL_MAP = {
  SUPER_ADMIN: 100,
  MANAGER: 50,
  STAFF: 20,
  CONTENT_EDITOR: 15,
  VIEWER: 10,
};

// Before saving user:
if (user.roleLevel !== ROLE_LEVEL_MAP[user.role]) {
  throw new Error('Role level does not match role');
}
```

### Rule 2: Permissions Must Match Role Capabilities

**Validation:**
```typescript
// Example: VIEWER should not have delete permissions
const INVALID_PERMISSIONS_FOR_VIEWER = [
  'products.delete',
  'products.create',
  'users.manage_roles',
  'settings.edit',
];

if (user.role === 'VIEWER') {
  const hasInvalidPermission = user.permissions.some(p =>
    INVALID_PERMISSIONS_FOR_VIEWER.includes(p)
  );
  
  if (hasInvalidPermission) {
    throw new Error('Invalid permissions for VIEWER role');
  }
}
```

### Rule 3: SUPER_ADMIN Always Has Full Access

**Enforcement:**
```typescript
// When checking permissions for SUPER_ADMIN:
if (user.role === 'SUPER_ADMIN') {
  return true; // Bypass all permission checks
}
```

---

## 🧪 Testing Database Changes

### Test 1: Verify Migration
```typescript
// Check all users have permissions array
const usersWithoutPermissions = await prisma.user.count({
  where: {
    permissions: { isEmpty: true }
  }
});

console.log(`Users without permissions: ${usersWithoutPermissions}`);
// Should be 0 after migration
```

### Test 2: Verify Role Levels
```typescript
// Check all users have correct role levels
const users = await prisma.user.findMany({
  select: { role: true, roleLevel: true }
});

const EXPECTED_LEVELS = {
  SUPER_ADMIN: 100,
  MANAGER: 50,
  STAFF: 20,
  CONTENT_EDITOR: 15,
  VIEWER: 10,
};

for (const user of users) {
  if (user.roleLevel !== EXPECTED_LEVELS[user.role]) {
    console.error(`❌ User has incorrect role level:`, user);
  }
}
```

### Test 3: Verify Indexes
```sql
-- Check if indexes exist
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'users';

-- Should show:
-- users_role_idx
-- users_roleLevel_idx
```

---

## 🔄 Rollback Plan

### If Something Goes Wrong

**Step 1: Restore from Backup**
```bash
# Restore database backup
psql -U postgres -d your_database < backup.sql
```

**Step 2: Roll Back Migration**
```bash
# Find migration name
npx prisma migrate status

# Roll back specific migration
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

**Step 3: Remove RBAC Changes**
```prisma
// Revert prisma/schema.prisma to previous version
// Remove: permissions, roleLevel fields
// Revert: UserRole enum to original

// Then create new migration
npx prisma migrate dev --name rollback_rbac
```

---

## 📝 Summary

### What Changed:
- ✅ Added 4 new roles to UserRole enum
- ✅ Added `permissions` field (text array)
- ✅ Added `roleLevel` field (integer)
- ✅ Added database indexes for performance
- ✅ Migrated existing users to new system

### Database Impact:
- **Table:** `users` (modified)
- **New Columns:** 2 (`permissions`, `roleLevel`)
- **New Indexes:** 2 (on `role` and `roleLevel`)
- **Enum Values:** 4 new role types added

### Migration Safety:
- ✅ Backward compatible (keeps ADMIN temporarily)
- ✅ Default values prevent NULL errors
- ✅ Automated migration script
- ✅ Rollback plan available

---

**Next Document:** [05-UI-MOCKUPS.md](./05-UI-MOCKUPS.md) - Visual guide to admin interface
