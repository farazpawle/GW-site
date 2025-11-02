# Phase 8: User Management System

**Status:** 📋 Planned  
**Priority:** LOW (Admin Feature)  
**Started:** Not yet  
**Estimated Time:** 2 hours  
**Completion:** 0%

---

## 🎯 Goal

Build a user management system that allows admin users to view all users, manage their roles (ADMIN/VIEWER), monitor user activity, and maintain control over who has access to the admin panel.

**What Success Looks Like:**
- ✅ List all users with search and filter
- ✅ View user details and activity
- ✅ Assign and change user roles
- ✅ Track user login activity
- ✅ Prevent accidental self-demotion
- ✅ Audit trail for role changes
- ✅ Secure role management (admins only)

---

## 📋 Tasks

### Task 1: Create Users List Page
**Time:** 30 minutes

**Features:**
- Table showing all users:
  - Avatar (from Clerk)
  - Full Name
  - Email
  - Role (ADMIN/VIEWER badge)
  - Created Date
  - Last Sign In
  - Actions (View, Edit Role)
- Search by name or email
- Filter by role
- Pagination (20 users per page)

**Files to Create:**
- `src/app/admin/users/page.tsx` - Users list page
- `src/components/admin/users/UserTable.tsx` - Users table component
- `src/components/admin/users/RoleBadge.tsx` - Role badge component

**Database Query:**
```typescript
const users = await prisma.user.findMany({
  where: {
    OR: [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { email: { contains: searchQuery, mode: 'insensitive' } }
    ],
    ...(roleFilter && { role: roleFilter })
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: (page - 1) * 20
})

const totalUsers = await prisma.user.count({ where: { /* same where */ } })
```

---

### Task 2: Create User Details Page
**Time:** 25 minutes

**Features:**
- User profile information:
  - Large avatar
  - Full name, email
  - Clerk user ID
  - Current role
  - Account created date
  - Last sign in date
  - Total orders placed (if customer features added)
- Activity timeline (recent logins, role changes)
- Quick actions:
  - Change Role button
  - View in Clerk button (opens Clerk dashboard)

**Files to Create:**
- `src/app/admin/users/[userId]/page.tsx` - User details page
- `src/components/admin/users/UserProfile.tsx` - User profile card
- `src/components/admin/users/ActivityTimeline.tsx` - Activity log

---

### Task 3: Create Role Management System
**Time:** 30 minutes

**Features:**
- Role change dialog/modal:
  - Current role display
  - New role selector (ADMIN/VIEWER)
  - Confirmation step
  - Warning if changing own role
  - Reason/note field (optional)
- Prevent self-demotion (can't remove own ADMIN role)
- Success/error toast notifications
- Optimistic UI updates

**Files to Create:**
- `src/components/admin/users/ChangeRoleDialog.tsx` - Role change modal
- `src/app/api/admin/users/[userId]/role/route.ts` - Role update API
- `src/lib/admin/role-management.ts` - Role change logic

**API Route Logic:**
```typescript
// POST /api/admin/users/[userId]/role
export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const currentUser = await requireAdmin()
  const { newRole, note } = await req.json()
  
  // Prevent self-demotion
  if (params.userId === currentUser.id && newRole === 'VIEWER') {
    return NextResponse.json(
      { error: 'Cannot remove your own admin privileges' },
      { status: 403 }
    )
  }
  
  // Update role
  await prisma.user.update({
    where: { id: params.userId },
    data: { role: newRole }
  })
  
  // Log the change (optional audit trail)
  await prisma.roleChangeLog.create({
    data: {
      userId: params.userId,
      changedBy: currentUser.id,
      oldRole: targetUser.role,
      newRole: newRole,
      note: note || null
    }
  })
  
  return NextResponse.json({ success: true })
}
```

---

### Task 4: Add Activity Tracking
**Time:** 20 minutes

**Features:**
- Track user activity:
  - Login events (from Clerk webhook or session)
  - Role changes (from audit log)
  - Admin actions performed (optional)
- Display activity on user details page
- Filter activity by type and date

**Files to Create:**
- `src/lib/admin/activity-tracker.ts` - Activity tracking utilities
- `src/app/api/admin/users/[userId]/activity/route.ts` - Activity fetch API

**Database Schema Addition (Optional):**
```prisma
model RoleChangeLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  changedBy   String
  changedByUser User   @relation("RoleChangedBy", fields: [changedBy], references: [id])
  oldRole     UserRole
  newRole     UserRole
  note        String?
  createdAt   DateTime @default(now())
}

model UserActivity {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String   // 'LOGIN', 'ROLE_CHANGED', 'PRODUCT_CREATED', etc.
  details     String?
  ipAddress   String?
  createdAt   DateTime @default(now())
}
```

---

### Task 5: Add Bulk Role Assignment (Optional)
**Time:** 15 minutes

**Features:**
- Select multiple users (checkboxes)
- Bulk role change
- Confirmation dialog showing affected users
- Warning if current user is in selection

**Files to Create:**
- `src/components/admin/users/BulkRoleDialog.tsx` - Bulk role change
- `src/app/api/admin/users/bulk-role/route.ts` - Bulk update API

---

### Task 6: Create User Statistics Card
**Time:** 10 minutes

**Features:**
- Display on dashboard (/admin):
  - Total users count
  - Admins count
  - Viewers count
  - New users this month
- Link to users page

**Files to Update:**
- `src/app/admin/page.tsx` - Add user stats

---

### Task 7: Add Navigation Link
**Time:** 5 minutes

**Actions:**
- Add "Users" link to sidebar
- Use Users icon from lucide-react
- Set active state for /admin/users routes

**Files to Update:**
- `src/components/admin/Sidebar.tsx` - Add Users nav item

---

### Task 8: Polish & Test
**Time:** 15 minutes

**Actions:**
- Test role changes:
  - Self-demotion prevention works
  - Role updates immediately reflected
  - Unauthorized access blocked
- Test search and filters
- Verify activity logs are accurate
- Check responsive layout
- Security audit:
  - Non-admins can't access /admin/users
  - API routes protected with requireAdmin()
  - No sensitive data exposed in frontend

---

## 📁 Files Structure

```
src/
├── app/
│   └── admin/
│       └── users/
│           ├── page.tsx                   (NEW) Users list
│           └── [userId]/
│               └── page.tsx               (NEW) User details
│
├── components/admin/
│   └── users/
│       ├── UserTable.tsx                  (NEW) Users table
│       ├── RoleBadge.tsx                  (NEW) Role badge
│       ├── UserProfile.tsx                (NEW) User profile card
│       ├── ActivityTimeline.tsx           (NEW) Activity log
│       ├── ChangeRoleDialog.tsx           (NEW) Role change modal
│       └── BulkRoleDialog.tsx             (NEW) Bulk role change
│
├── app/api/admin/
│   └── users/
│       ├── bulk-role/
│       │   └── route.ts                   (NEW) Bulk role update
│       └── [userId]/
│           ├── role/
│           │   └── route.ts               (NEW) Role update API
│           └── activity/
│               └── route.ts               (NEW) Activity fetch API
│
└── lib/admin/
    ├── role-management.ts                 (NEW) Role logic
    └── activity-tracker.ts                (NEW) Activity tracking
```

---

## 🎨 Design Specifications

### Users List Page Layout
```
┌────────────────────────────────────────────────────────┐
│  Users                    [Search: ____] [Role: ▼]     │
├────────────────────────────────────────────────────────┤
│  Avatar  Name            Email             Role   Last  │
│  ───────────────────────────────────────────────────── │
│  [JD]    John Doe       john@example.com  ADMIN  2h ago│
│  [SA]    Sarah Admin    sarah@example.com ADMIN  1d ago│
│  [MV]    Mike Viewer    mike@example.com  VIEWER 3d ago│
│  [AJ]    Alice Johnson  alice@example.com VIEWER 5d ago│
│  ...                                                    │
│                                                         │
│  Showing 1-20 of 45 users    [<< Prev] [Next >>]      │
└────────────────────────────────────────────────────────┘
```

### User Details Page Layout
```
┌────────────────────────────────────────────────────────┐
│  ← Back to Users                                        │
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐ │
│  │  [Large Avatar]     John Doe                     │ │
│  │                     john@example.com             │ │
│  │                     [ADMIN Badge]                │ │
│  │                     Member since Jan 15, 2025    │ │
│  │                                                  │ │
│  │  [Change Role]  [View in Clerk Dashboard]       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  Activity Timeline                                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │  🔵 Logged in                      2 hours ago   │ │
│  │  🟢 Role changed to ADMIN          3 days ago    │ │
│  │  🔵 Logged in                      3 days ago    │ │
│  │  🔵 Logged in                      1 week ago    │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Role Change Dialog
```
┌──────────────────────────────────────┐
│  Change User Role                    │
├──────────────────────────────────────┤
│  User: John Doe (john@example.com)   │
│                                      │
│  Current Role: VIEWER                │
│  New Role:     [ADMIN ▼]             │
│                                      │
│  Note (optional):                    │
│  [___________________________]       │
│                                      │
│  ⚠️ Warning: This user will gain     │
│     full admin access.               │
│                                      │
│            [Cancel]  [Confirm]       │
└──────────────────────────────────────┘
```

### Role Badge Styles
```typescript
const roleBadgeStyles = {
  ADMIN: 'bg-[#8B1538] text-white border-[#8B1538]',
  VIEWER: 'bg-gray-800 text-gray-300 border-gray-700'
}
```

---

## 🔧 Technical Requirements

### Security Checks
```typescript
// src/lib/admin/role-management.ts
export async function canChangeRole(
  currentUserId: string,
  targetUserId: string,
  newRole: UserRole
): Promise<{ allowed: boolean; reason?: string }> {
  // Prevent self-demotion
  if (currentUserId === targetUserId && newRole === 'VIEWER') {
    return {
      allowed: false,
      reason: 'Cannot remove your own admin privileges'
    }
  }
  
  // Only admins can change roles (checked by requireAdmin)
  return { allowed: true }
}
```

### Database Indexes
```sql
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created ON users(createdAt);
CREATE INDEX idx_users_email ON users(email);
```

---

## ✅ Acceptance Criteria

**Functional Requirements:**
- [ ] All users listed correctly
- [ ] Search by name/email works
- [ ] Filter by role works
- [ ] Role changes successfully
- [ ] Self-demotion prevented
- [ ] Activity log displays correctly
- [ ] Pagination works
- [ ] User details page loads

**Non-Functional Requirements:**
- [ ] Only admins can access /admin/users
- [ ] API routes protected
- [ ] No sensitive data exposed
- [ ] Fast queries (< 1s)
- [ ] Responsive design

**User Experience:**
- [ ] Clear role badges
- [ ] Confirmation dialogs for role changes
- [ ] Success/error notifications
- [ ] Loading states
- [ ] Helpful error messages

---

## 🐛 Known Challenges

### Challenge 1: Self-Demotion Prevention
**Issue:** Admin accidentally removes own admin role  
**Solution:** Block API request if currentUser === targetUser && newRole === VIEWER

### Challenge 2: Last Admin Protection
**Issue:** What if only one admin exists and they try to change role?  
**Solution:** Check admin count before allowing change:
```typescript
const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
if (adminCount === 1 && currentUser.role === 'ADMIN' && newRole === 'VIEWER') {
  throw new Error('Cannot remove last admin')
}
```

### Challenge 3: Clerk Sync Issues
**Issue:** User exists in Clerk but not in database  
**Solution:** Clerk webhook should auto-sync users. Add manual sync button if needed.

---

## 💡 Future Enhancements

- [ ] User invite system (send invitation emails)
- [ ] Custom permissions beyond ADMIN/VIEWER (e.g., EDITOR, MODERATOR)
- [ ] User groups/teams
- [ ] Advanced audit logs with detailed action tracking
- [ ] User impersonation (for debugging)
- [ ] Two-factor authentication enforcement
- [ ] User onboarding wizard
- [ ] Email notifications for role changes
- [ ] User deletion/deactivation
- [ ] Export user list to CSV

---

## 📊 User Metrics to Track

- Total users
- Active users (logged in last 30 days)
- Admin count
- Viewer count
- New users this week/month
- User growth rate
- Average session duration
- Most active users

---

## 📊 Progress Tracking

| Task | Estimated | Actual | Status |
|------|-----------|--------|--------|
| Users List Page | 30 min | - | ⬜ Not started |
| User Details Page | 25 min | - | ⬜ Not started |
| Role Management System | 30 min | - | ⬜ Not started |
| Activity Tracking | 20 min | - | ⬜ Not started |
| Bulk Role Assignment | 15 min | - | ⬜ Not started |
| User Statistics Card | 10 min | - | ⬜ Not started |
| Add Navigation Link | 5 min | - | ⬜ Not started |
| Polish & Test | 15 min | - | ⬜ Not started |
| **TOTAL** | **~2 hours** | - | - |

---

## 🔗 Dependencies

**Required Before Starting:**
- Phase 2: Admin UI Framework (auth system in place)
- Existing User model in Prisma schema
- requireAdmin() middleware working

**External Libraries:**
```json
{
  "None required - uses existing dependencies"
}
```

---

**Status:** Ready to implement anytime! 👥
