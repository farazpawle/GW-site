# Quick Reference - User & Database Management

## 🚀 Common Commands

### Check Users in Database
```bash
npx tsx scripts/list-users.ts
```

### Promote User to Admin
```bash
npx tsx scripts/setup-super-admin.ts --email=your@email.com
```

### Manual User Creation (if needed)
```bash
npx tsx scripts/sync-current-user.ts --id=user_xxx --email=your@email.com --promote
```

---

## 🔄 Migration Workflow

### Safe Migration (Recommended)
```bash
# 1. Backup users (optional - auto-sync will recover)
npx tsx scripts/list-users.ts > backup_users.txt

# 2. Run migration
npx prisma migrate dev --name your_migration_name

# 3. Sign in to trigger auto-sync
# (Go to http://localhost:3000 and log in)

# 4. Restore admin access
npx tsx scripts/setup-super-admin.ts --email=your@email.com

# 5. Verify
npx tsx scripts/list-users.ts
```

### Quick Reset (Development Only)
```bash
# Nuclear option - complete database reset
npx prisma migrate reset

# Then sign in and promote yourself:
npx tsx scripts/setup-super-admin.ts --email=your@email.com
```

---

## 🔍 Troubleshooting

### "Admin page redirects to homepage"
```bash
# Check your user role
npx tsx scripts/list-users.ts

# If not ADMIN or SUPER_ADMIN:
npx tsx scripts/setup-super-admin.ts --email=your@email.com
```

### "No users in database"
```bash
# Solution 1: Just sign in (auto-sync will create user)
# Then promote: npx tsx scripts/setup-super-admin.ts --email=your@email.com

# Solution 2: Manual sync
npx tsx scripts/sync-current-user.ts --id=user_xxx --email=your@email.com --promote
```

### "Get Clerk User ID"
Open browser console at http://localhost:3000:
```javascript
Clerk.user.id
// Copy: user_xxxxxxxxxxxxx
```

---

## 🛡️ Auto-Sync System

**What it does**: Automatically creates users in database if they exist in Clerk

**When it activates**: Every time a user accesses the site

**How to verify**: Check terminal logs:
```
🔍 [getCurrentUser] Clerk userId: user_abc123
⚠️  [getCurrentUser] User authenticated in Clerk but not in database. Auto-syncing...
✅ [getCurrentUser] User auto-synced to database: john@example.com ( VIEWER )
```

---

## 📝 User Roles

| Role | Access Level |
|------|--------------|
| `VIEWER` | Read-only access (default for new users) |
| `USER` | Standard user access |
| `ADMIN` | Full admin panel access |
| `SUPER_ADMIN` | Highest level access |

---

## 🎯 Quick Fixes

### I can't access admin panel
```bash
npx tsx scripts/setup-super-admin.ts --email=your@email.com
```

### Database is empty after migration
```bash
# Just sign in - auto-sync will recover your user
# Then: npx tsx scripts/setup-super-admin.ts --email=your@email.com
```

### Need to create multiple admins
```bash
npx tsx scripts/setup-super-admin.ts --email=admin1@example.com
npx tsx scripts/setup-super-admin.ts --email=admin2@example.com
```

---

## 📚 Documentation

- **Full Guide**: `docs/DATABASE-MIGRATION-GUIDE.md`
- **Webhook Setup**: See full guide for detailed webhook configuration
- **Architecture**: See full guide for system architecture diagram

---

## ⚡ Emergency Recovery

If everything breaks:

```bash
# 1. Reset database
npx prisma migrate reset

# 2. Go to http://localhost:3000 and sign in
# (Auto-sync creates your user)

# 3. Promote yourself to admin
npx tsx scripts/setup-super-admin.ts --email=your@email.com

# 4. Done! ✅
```

---

**🎓 Key Insight**: The auto-sync system makes this project resilient. Even if the database is wiped, users are automatically recreated on first login. You only need to restore admin roles.
