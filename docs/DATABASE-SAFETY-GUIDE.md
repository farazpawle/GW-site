# Database Safety Guide - PREVENT DATA LOSS

## ⚠️ CRITICAL COMMANDS TO AVOID IN PRODUCTION

### 🔴 NEVER RUN THESE (Destroy All Data):
```bash
# DESTROYS EVERYTHING - Only use in dev with fresh start
prisma migrate reset

# DANGEROUS - Can drop tables if schema conflicts
prisma db push --accept-data-loss

# WIPES DATABASE - Resets to initial state
npm run db:reset
```

---

## ✅ SAFE MIGRATION WORKFLOW

### Step 1: Backup Database BEFORE Schema Changes
```bash
# Automatic backup with timestamp
npm run db:backup

# Manual PostgreSQL backup
pg_dump -U garritwulf_user -h localhost garritwulf_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Make Schema Changes
Edit `prisma/schema.prisma` with your changes

### Step 3: Create Migration (Preview First)
```bash
# See what SQL will be generated (SAFE - no changes applied)
npx prisma migrate dev --create-only

# Review the SQL file in prisma/migrations/[timestamp]_[name]/migration.sql
# Check for DROP TABLE, DROP COLUMN, or other destructive operations
```

### Step 4: Apply Migration
```bash
# Apply the migration after reviewing SQL
npx prisma migrate dev

# Or apply to production
npx prisma migrate deploy
```

---

## 🛡️ DATA PRESERVATION STRATEGIES

### 1. Renaming Fields (Safe)
```prisma
// ✅ SAFE - Add new field, keep old one temporarily
model User {
  oldFieldName String  // Keep this
  newFieldName String? // Add this
}
```

**Migration Strategy:**
1. Add `newFieldName` as optional
2. Run migration
3. Copy data: `UPDATE users SET newFieldName = oldFieldName`
4. Make `newFieldName` required if needed
5. Remove `oldFieldName` in next migration

### 2. Changing Field Types (DANGEROUS)
```prisma
// 🔴 DANGEROUS - Can lose data
model Product {
  price Int  // Changed from Decimal - will truncate values!
}
```

**Safe Strategy:**
1. Add new field with new type
2. Migrate data with transformation
3. Remove old field
4. Rename new field

### 3. Adding Required Fields to Existing Tables (DANGEROUS)
```prisma
// 🔴 DANGEROUS - Existing rows have no value
model User {
  requiredField String  // Added to table with existing data!
}
```

**Safe Strategy:**
```prisma
// ✅ SAFE - Add as optional first
model User {
  requiredField String?  // Optional initially
}
```
Then:
1. Run migration
2. Populate data: `UPDATE users SET requiredField = 'default_value'`
3. Make required in next migration

### 4. Removing Fields (PERMANENT DATA LOSS)
```prisma
// 🔴 DANGEROUS - Data is permanently deleted
model Product {
  // oldField String  <- Removing this deletes all data in this column!
}
```

**Safe Strategy:**
1. Stop using field in code
2. Deploy code without field usage
3. Wait 1-2 weeks (safety buffer)
4. Remove field from schema
5. Run migration

---

## 🔄 ROLLBACK STRATEGIES

### Undo Last Migration (If Not Deployed)
```bash
# View migration history
npx prisma migrate status

# Mark last migration as rolled back
npx prisma migrate resolve --rolled-back [migration_name]

# Restore from backup
psql -U garritwulf_user -h localhost garritwulf_db < backup.sql
```

### Emergency: Restore from Backup
```bash
# 1. Drop current database
dropdb -U garritwulf_user -h localhost garritwulf_db

# 2. Create fresh database
createdb -U garritwulf_user -h localhost garritwulf_db

# 3. Restore from backup
psql -U garritwulf_user -h localhost garritwulf_db < backup.sql

# 4. Update Prisma client
npx prisma generate
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before running ANY migration:

- [ ] ✅ Database backup created and verified
- [ ] ✅ Migration SQL reviewed for DROP/DELETE operations
- [ ] ✅ Tested migration on local copy of production data
- [ ] ✅ Data transformation scripts ready (if needed)
- [ ] ✅ Rollback plan documented
- [ ] ✅ Team notified (if production)
- [ ] ✅ Maintenance window scheduled (if breaking changes)

---

## 🏗️ SAFE SCHEMA EVOLUTION PATTERNS

### Adding Tables (Always Safe)
```prisma
// ✅ SAFE - New tables don't affect existing data
model NewFeature {
  id String @id @default(cuid())
  name String
}
```

### Adding Optional Fields (Safe)
```prisma
model User {
  newField String?  // ✅ Optional = Safe
}
```

### Adding Relations (Usually Safe)
```prisma
model Post {
  authorId String?  // ✅ Optional foreign key = Safe
  author User? @relation(fields: [authorId], references: [id])
}
```

### Index Changes (Safe)
```prisma
model Product {
  name String
  @@index([name])  // ✅ Indexes don't affect data
}
```

---

## 🚨 EMERGENCY CONTACTS

If you accidentally run a destructive migration:

1. **STOP IMMEDIATELY** - Don't run any more commands
2. **Check if backup exists** - `ls -lh backup_*.sql`
3. **Restore from backup** - See "Emergency: Restore from Backup" above
4. **Contact team lead** (if production)

---

## 📝 DEVELOPMENT vs PRODUCTION

### Development Database (Can Reset Freely)
```bash
# It's OK to reset dev database - no real data
npm run db:reset
npx prisma migrate reset
```

### Production Database (NEVER RESET)
```bash
# ONLY use these commands in production
npx prisma migrate deploy  # ✅ Safe - applies pending migrations
npx prisma generate        # ✅ Safe - updates Prisma client
```

**Golden Rule:** If you're not 100% sure, make a backup first!

---

## 🔧 AUTOMATED BACKUP SCRIPT

Add to `package.json`:
```json
{
  "scripts": {
    "db:backup": "pg_dump -U garritwulf_user -h localhost garritwulf_db > backups/backup_$(date +%Y%m%d_%H%M%S).sql",
    "db:restore": "psql -U garritwulf_user -h localhost garritwulf_db < $BACKUP_FILE"
  }
}
```

Create backups directory:
```bash
mkdir -p backups
echo "backups/" >> .gitignore
```

---

## 📖 FURTHER READING

- [Prisma Migration Best Practices](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate)
- [Zero-Downtime Migrations](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
- [PostgreSQL Backup Strategies](https://www.postgresql.org/docs/current/backup.html)

---

**Remember:** Schema changes are permanent. Always backup first! 🔒
