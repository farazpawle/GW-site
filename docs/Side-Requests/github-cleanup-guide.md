# Remove Sensitive Files from GitHub

This script removes critical files from GitHub while keeping them locally.

## Files to Remove:

```bash
# 1. Remove nginx.conf (no longer needed)
git rm --cached nginx.conf

# 2. Remove sensitive configuration files
git rm --cached .env.example
git rm --cached .env.local.example

# 3. Remove core business logic (makes project incomplete)
git rm --cached src/lib/minio.ts
git rm --cached src/lib/auth.ts
git rm --cached src/middleware.ts

# 4. Remove database seeding (hides your data structure)
git rm --cached prisma/seed.ts

# 5. Remove webhook endpoints (critical for auth)
git rm --cached src/app/api/webhooks/clerk/route.ts

# 6. Remove admin API routes (makes admin panel non-functional)
git rm --cached -r src/app/api/admin/

# 7. Commit and push
git commit -m "Remove sensitive files from repository"
git push origin main
```

## What This Does:

✅ Removes files from GitHub  
✅ Keeps files locally  
✅ Makes project incomplete/non-functional for others  
✅ Protects your implementation details  

## To Run:

```bash
cd "C:\Users\rosto\OneDrive\Desktop\GW site"
# Then run commands above one by one
```

---

**Status**: Ready to execute
