# Role-Based Access Control (RBAC) System - Overview

## 📋 What is RBAC?

**Role-Based Access Control (RBAC)** is a security system that controls who can access what in your admin panel based on their **role** (job title) and **permissions** (specific actions they can do).

Think of it like a building with different security levels:
- 🔴 **Super Admin** = Master key (opens everything)
- 🟡 **Manager** = Department key (opens their area + some shared areas)
- 🟢 **Staff** = Office key (opens only their workspace)

---

## 🎯 Your Requirements (Simplified)

### What You Asked For:

1. **Multiple Roles**: Super Admin, Manager, Staff, Content Editor, etc.
2. **Hierarchical Access**: Lower roles cannot see/manage higher role users
3. **Page-Level Permissions**: Control who can access which admin pages
4. **Action-Level Permissions**: Control specific actions (create, edit, delete)
5. **Flexible Assignment**: Permissions can be assigned or removed per role

### What We'll Build:

✅ **5 Pre-defined Roles** (ready to use)  
✅ **20+ Permissions** (covering all admin features)  
✅ **Role Hierarchy** (prevents lower roles from managing higher ones)  
✅ **Permission Templates** (quick setup for common job types)  
✅ **Easy UI** (simple checkboxes for managing permissions)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Login (Clerk)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              User Record in Database                     │
│  • id: "user_123"                                        │
│  • email: "john@example.com"                             │
│  • role: "STAFF"                                         │
│  • permissions: ["products.view", "products.edit"]       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Middleware Check                            │
│  1. Is user trying to access /admin/*?                   │
│  2. Does user have required permission?                  │
│  3. Allow or Deny access                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Admin Page Loads                            │
│  • Show only allowed menu items                          │
│  • Hide actions user cannot perform                      │
│  • Display based on permissions                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Document Structure

This folder contains 6 documents that explain everything:

| Document | Purpose | Read If... |
|----------|---------|-----------|
| **00-RBAC-OVERVIEW.md** (this file) | High-level introduction | You want to understand the big picture |
| **01-ROLES-EXPLAINED.md** | All roles and their purposes | You want to know what each role does |
| **02-PERMISSIONS-LIST.md** | Complete list of permissions | You need to see all available permissions |
| **03-IMPLEMENTATION-PLAN.md** | Step-by-step build guide | You're ready to implement this |
| **04-DATABASE-CHANGES.md** | Database schema modifications | You need to update the database |
| **05-UI-MOCKUPS.md** | Admin UI screens and flows | You want to see how users will interact |

---

## 🚀 Quick Start

### For Understanding (Read First):
1. Read this file (00-RBAC-OVERVIEW.md) ✅ You're here!
2. Read **01-ROLES-EXPLAINED.md** to understand the 5 roles
3. Read **02-PERMISSIONS-LIST.md** to see what each permission does

### For Implementation (Build Phase):
4. Read **04-DATABASE-CHANGES.md** to update database
5. Read **03-IMPLEMENTATION-PLAN.md** for step-by-step code
6. Read **05-UI-MOCKUPS.md** to build admin screens

---

## 🎨 Key Concepts (Simplified)

### 1. **Role** = Job Title
A role is a user's job title or responsibility level.

**Example Roles:**
- `SUPER_ADMIN` - Owner/Full access
- `MANAGER` - Department head
- `STAFF` - Regular employee
- `CONTENT_EDITOR` - Blog writer
- `VIEWER` - Read-only access

### 2. **Permission** = Specific Action
A permission is one specific thing a user can do.

**Example Permissions:**
- `products.view` - Can see products list
- `products.create` - Can add new products
- `products.edit` - Can modify products
- `products.delete` - Can remove products
- `users.manage_roles` - Can change user roles

### 3. **Role Hierarchy** = Power Levels
Some roles have more power than others, and lower roles cannot manage higher ones.

```
SUPER_ADMIN (Level 100) ━━━ Can manage everyone
    ↓
MANAGER (Level 50) ━━━━━━━ Can manage Staff & Editors
    ↓
STAFF (Level 20) ━━━━━━━━ Can manage Viewers
    ↓
CONTENT_EDITOR (Level 15) ━ Cannot manage anyone
    ↓
VIEWER (Level 10) ━━━━━━━━ Cannot manage anyone
```

**Rule:** You can only manage users whose level is **lower** than yours.

### 4. **Permission Assignment** = Giving Access
Each role has a default set of permissions, but you can add/remove permissions.

**Example:**
- Default STAFF role has: `products.view`, `products.edit`
- You can add: `products.create` (now they can add products)
- You can remove: `products.edit` (now they can only view)

---

## 🔐 How It Works (Real Example)

### Scenario: Sarah the Content Editor

1. **Sarah logs in** using her email
2. **System checks database**: Sarah has role = `CONTENT_EDITOR`
3. **System loads permissions**: Sarah can:
   - View products (`products.view`)
   - Edit products (`products.edit`)
   - View categories (`categories.view`)
   - Cannot delete products ❌
   - Cannot manage users ❌
   - Cannot change settings ❌

4. **Sarah sees admin menu**:
   ```
   ✅ Products (can access)
   ✅ Categories (can access)
   ❌ Users (hidden - no permission)
   ❌ Settings (hidden - no permission)
   ```

5. **Sarah opens Products page**:
   - ✅ Can see products list
   - ✅ Can click "Edit" button
   - ❌ "Delete" button is hidden (no permission)
   - ❌ "Create New" button is hidden (no permission)

6. **Sarah tries to access /admin/users directly** (by typing URL):
   - ❌ Middleware blocks access
   - ❌ Redirected to dashboard with error message

---

## 💡 Benefits of This System

### 1. **Security**
- Users cannot access pages/actions they shouldn't
- Even if they know the URL, middleware blocks them
- Database validates permissions on every action

### 2. **Flexibility**
- Easy to add new roles (e.g., "Inventory Manager")
- Easy to add new permissions (e.g., "reports.export")
- Can customize permissions per user if needed

### 3. **Scalability**
- Works for 5 users or 500 users
- Clear separation of concerns
- Easy to maintain and extend

### 4. **User-Friendly**
- Simple UI with checkboxes
- Clear labels explaining each permission
- Instant visual feedback on access changes

### 5. **Audit Trail**
- Track who changed what permissions
- See when roles were assigned
- Monitor permission usage (future feature)

---

## 🎯 What's Different from Current System?

### Current System:
```
User has role: ADMIN or VIEWER
  → ADMIN: Can do everything
  → VIEWER: Can do nothing (read-only)
```

❌ **Problems:**
- Only 2 roles (too simple)
- Cannot give partial access
- All admins have same power
- Cannot control specific actions

### New RBAC System:
```
User has role: SUPER_ADMIN, MANAGER, STAFF, CONTENT_EDITOR, VIEWER
  → Each role has specific permissions
  → Permissions can be customized
  → Granular control over pages and actions
  → Role hierarchy prevents unauthorized management
```

✅ **Solutions:**
- 5 roles covering all use cases
- Fine-grained access control
- Different admin power levels
- Complete control over every feature

---

## 📈 Migration Path (How to Upgrade)

Don't worry! Existing users will automatically upgrade:

```
Current ADMIN → Becomes SUPER_ADMIN (full access)
Current VIEWER → Stays VIEWER (read-only)
```

All existing functionality stays the same, but now you have MORE options.

---

## 🎓 Learning Path

**If you're new to RBAC:**
1. Read this overview (you're almost done! 🎉)
2. Read **01-ROLES-EXPLAINED.md** - learn about each role
3. Experiment with a test user in your dev environment
4. Read implementation docs when ready to build

**If you're familiar with RBAC:**
1. Skim this overview
2. Jump to **02-PERMISSIONS-LIST.md** for technical details
3. Read **03-IMPLEMENTATION-PLAN.md** to start coding
4. Reference **04-DATABASE-CHANGES.md** for schema

---

## 🤝 Need Help?

If something is unclear, remember:
- **Roles** = Job titles (who you are)
- **Permissions** = Actions you can do (what you can do)
- **Hierarchy** = Power levels (who you can manage)

Read the other documents in order, and it will all make sense! 🚀

---

**Next Document:** [01-ROLES-EXPLAINED.md](./01-ROLES-EXPLAINED.md) - Learn about each role in detail
