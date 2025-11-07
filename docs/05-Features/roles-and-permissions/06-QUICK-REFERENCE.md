# Role-Based Access Control (RBAC) - Quick Reference

## 📋 What is This?

This is a **quick reference guide** for the RBAC system. Use this when you need to quickly look up roles, permissions, or implementation steps.

For detailed explanations, see the other documents in this folder.

---

## 🎯 5 Roles (Quick Overview)

| Role | Level | Who | Can Do |
|------|-------|-----|--------|
| **SUPER_ADMIN** | 100 | Owner/CTO | Everything (all permissions) |
| **MANAGER** | 50 | Department Head | Manage content + team (no role changes) |
| **STAFF** | 20 | Regular Employee | View/Edit content (limited create/delete) |
| **CONTENT_EDITOR** | 15 | Content Writer | Create/Edit content (no delete/manage) |
| **VIEWER** | 10 | Read-Only | View only (no modifications) |

**Rule:** Higher level can manage lower level users.

---

## 🔑 Key Permissions (Quick Reference)

### Products
- `products.view` - See products
- `products.create` - Add products
- `products.edit` - Modify products
- `products.delete` - Remove products
- `products.publish` - Publish/unpublish
- `products.*` - All of the above

### Users
- `users.view` - See user list
- `users.create` - Add users
- `users.edit` - Modify users (hierarchy enforced)
- `users.delete` - Remove users (hierarchy enforced)
- `users.manage_roles` - Change user roles (SUPER_ADMIN only)
- `users.*` - All of the above

### Settings
- `settings.view` - View settings
- `settings.edit` - Modify settings
- `settings.*` - All settings (SUPER_ADMIN only)

**See [02-PERMISSIONS-LIST.md](./02-PERMISSIONS-LIST.md) for complete list (43 permissions)**

---

## 🚀 Quick Implementation Steps

### 1. Database (30 minutes)
```bash
# Update schema
# Add: permissions: String[] and roleLevel: Int to User model

# Run migration
npx prisma migrate dev --name add_rbac_system

# Migrate existing users
npx tsx scripts/migrate-to-rbac.ts
```

### 2. Permission System (1 hour)
Create these files:
- `src/lib/rbac/permissions.ts` - Permission constants
- `src/lib/rbac/check-permission.ts` - Permission checker
- `src/lib/rbac/guards.ts` - API route guards

### 3. Update Auth (30 minutes)
- Update `src/lib/auth.ts` with permission helpers
- Update `src/middleware.ts` with permission checks

### 4. Update API Routes (2 hours)
Replace:
```typescript
const user = await checkAdmin();
```

With:
```typescript
const userOrError = await requirePermission(PERMISSIONS.PRODUCTS_EDIT);
if (userOrError instanceof NextResponse) return userOrError;
const user = userOrError;
```

### 5. Build Admin UI (4 hours)
- Users list page with role filters
- User edit page with permission manager
- Role badges and permission gates
- Dynamic menu based on permissions

**Total Time:** 8-10 hours (1-2 days)

---

## 💻 Code Snippets (Quick Copy-Paste)

### Check Permission (API Route)
```typescript
import { requirePermission } from '@/lib/rbac/guards';
import { PERMISSIONS } from '@/lib/rbac/permissions';

export async function POST(req: NextRequest) {
  const userOrError = await requirePermission(PERMISSIONS.PRODUCTS_CREATE);
  if (userOrError instanceof NextResponse) return userOrError;
  const user = userOrError;
  
  // Your code here
}
```

### Check Permission (Component)
```typescript
'use client';
import { useUser } from '@/hooks/useUser';
import { hasPermission } from '@/lib/rbac/check-permission';
import { PERMISSIONS } from '@/lib/rbac/permissions';

export default function MyComponent() {
  const { user } = useUser();
  const canEdit = user && hasPermission(user, PERMISSIONS.PRODUCTS_EDIT);

  return (
    <>
      {canEdit && <button>Edit</button>}
    </>
  );
}
```

### Permission Gate
```typescript
<PermissionGate permission="products.delete">
  <button onClick={handleDelete}>Delete</button>
</PermissionGate>
```

---

## 🔍 Quick Troubleshooting

### Problem: User has no permissions after migration
**Solution:**
```bash
npx tsx scripts/migrate-to-rbac.ts
```

### Problem: Permission check always fails
**Check:**
1. Permission string format: `resource.action` (lowercase)
2. User has permissions array in database
3. Permission exists in PERMISSIONS constant

### Problem: Cannot manage users
**Check:**
1. Your role level > target role level
2. You have `users.edit` or `users.*` permission
3. Not trying to manage yourself

### Problem: Menu items not hiding
**Check:**
1. Middleware is running (check `src/middleware.ts`)
2. Component checking permissions correctly
3. User object loaded properly

---

## 📁 File Structure

```
src/
├── lib/
│   ├── rbac/
│   │   ├── permissions.ts         ← Permission constants
│   │   ├── check-permission.ts    ← Permission checking logic
│   │   └── guards.ts              ← API route guards
│   └── auth.ts                    ← Auth helpers (updated)
├── middleware.ts                   ← Route protection (updated)
├── app/
│   ├── admin/
│   │   └── users/
│   │       ├── page.tsx           ← Users list
│   │       └── [id]/
│   │           └── page.tsx       ← User edit page
│   └── api/
│       └── admin/
│           ├── products/          ← Update with permission checks
│           ├── categories/        ← Update with permission checks
│           └── users/
│               └── [id]/
│                   └── role/
│                       └── route.ts ← Role management API
└── components/
    └── admin/
        └── users/
            ├── PermissionManager.tsx  ← Permission UI
            ├── RoleBadge.tsx          ← Role display
            └── PermissionGate.tsx     ← Permission wrapper

scripts/
├── migrate-to-rbac.ts             ← Migration script
└── create-test-users.ts           ← Create test users

prisma/
└── schema.prisma                  ← Updated schema
```

---

## 📚 Document Index

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **00-RBAC-OVERVIEW.md** | Introduction & concepts | Start here (understand the system) |
| **01-ROLES-EXPLAINED.md** | Detailed role descriptions | Learn what each role does |
| **02-PERMISSIONS-LIST.md** | Complete permission reference | Look up specific permissions |
| **03-IMPLEMENTATION-PLAN.md** | Step-by-step build guide | Ready to implement |
| **04-DATABASE-CHANGES.md** | Database schema details | Database migration help |
| **05-UI-MOCKUPS.md** | UI designs and flows | Building admin interface |
| **06-QUICK-REFERENCE.md** | This file (quick lookup) | Need fast answers |

---

## 🎯 Common Tasks

### Task: Create a New User with Specific Role
1. Go to `/admin/users`
2. Click "[+ New User]"
3. Enter email
4. Select role from dropdown
5. Review permissions (auto-assigned)
6. Click "Create User"

### Task: Change User's Role
1. Go to `/admin/users`
2. Click "Edit" on user
3. Select new role from dropdown
4. Click "Apply Role Template"
5. Review permissions (will reset to role defaults)
6. Click "Save Changes"

### Task: Customize User's Permissions
1. Go to `/admin/users`
2. Click "Edit" on user
3. Click "Customize Permissions"
4. Check/uncheck permissions
5. Click "Save Permissions"

### Task: Check if User Can Do Something
```typescript
import { hasPermission } from '@/lib/rbac/check-permission';
import { PERMISSIONS } from '@/lib/rbac/permissions';

if (hasPermission(user, PERMISSIONS.PRODUCTS_DELETE)) {
  // User can delete products
}
```

---

## ⚠️ Security Best Practices

### ✅ DO:
- Limit Super Admins to 1-3 trusted people
- Use principle of least privilege (lowest role needed)
- Check permissions on BOTH frontend AND backend
- Log permission changes in activity log
- Regularly audit user roles (every 3-6 months)
- Use role hierarchy to prevent unauthorized management

### ❌ DON'T:
- Give everyone Super Admin role
- Only check permissions on frontend (easily bypassed)
- Allow users to manage users at same/higher level
- Store permissions in localStorage (use server session)
- Hardcode user IDs for permission checks
- Skip permission checks in API routes

---

## 🧪 Testing Checklist

### Before Deployment:
- [ ] All existing users have permissions array
- [ ] Database migration successful
- [ ] Super Admin can access everything
- [ ] Manager cannot change roles
- [ ] Staff cannot delete products
- [ ] Content Editor cannot manage users
- [ ] Viewer cannot edit anything
- [ ] API routes protected with permission checks
- [ ] Frontend hides unauthorized actions
- [ ] Middleware blocks unauthorized routes

---

## 📞 Quick Help

### Need to...

**...understand the system?**
→ Read [00-RBAC-OVERVIEW.md](./00-RBAC-OVERVIEW.md)

**...know what a role can do?**
→ Read [01-ROLES-EXPLAINED.md](./01-ROLES-EXPLAINED.md)

**...find a specific permission?**
→ Read [02-PERMISSIONS-LIST.md](./02-PERMISSIONS-LIST.md)

**...implement the system?**
→ Read [03-IMPLEMENTATION-PLAN.md](./03-IMPLEMENTATION-PLAN.md)

**...update the database?**
→ Read [04-DATABASE-CHANGES.md](./04-DATABASE-CHANGES.md)

**...build the UI?**
→ Read [05-UI-MOCKUPS.md](./05-UI-MOCKUPS.md)

**...get quick answers?**
→ You're already here! (06-QUICK-REFERENCE.md)

---

## 🎓 Key Concepts (Remember These!)

1. **Roles** = Job titles (what you are)
2. **Permissions** = Actions (what you can do)
3. **Role Level** = Hierarchy position (who you can manage)
4. **Wildcard** (`*`) = All actions for a resource
5. **Super Admin** = Bypasses all checks (always allowed)
6. **Hierarchy Rule** = Can only manage users with lower level

---

## 📊 Default Role Permissions (Quick Matrix)

| Permission | Super Admin | Manager | Staff | Editor | Viewer |
|------------|-------------|---------|-------|--------|--------|
| View Content | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Content | ✅ | ✅ | ⚠️ | ✅ | ❌ |
| Edit Content | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Content | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ✅ Lower | ✅ Viewers | ❌ | ❌ |
| Change Roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🚀 Next Steps

1. **Read Overview** → Understand the system
2. **Review Roles** → Know what each role does
3. **Check Permissions** → See all available permissions
4. **Follow Implementation** → Build the system
5. **Test Everything** → Verify it works
6. **Deploy** → Go live!

---

**You're all set!** 🎉

For detailed information, refer to the specific document for each topic.
