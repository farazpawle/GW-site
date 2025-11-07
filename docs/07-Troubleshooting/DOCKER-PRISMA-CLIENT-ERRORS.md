# Docker Prisma Client Troubleshooting

## Common Error: "Cannot read properties of undefined (reading 'findMany')"

### Symptoms
- Homepage or other pages fail to load in Docker
- Error message: `TypeError: Cannot read properties of undefined (reading 'findMany')`
- Error occurs at: `prisma.pageSection.findMany()` or similar Prisma queries
- **Same code works perfectly with `npm run dev` locally**

### Root Cause
The Prisma Client inside the Docker container is **stale** or **not generated** after schema changes. This happens because:
1. Docker uses volume mounts for source code
2. `node_modules` is isolated inside the container
3. Schema changes made outside Docker don't automatically regenerate the client inside Docker

### Quick Fix (Immediate)
Run this command to regenerate Prisma Client inside the running container:

```bash
docker-compose exec nextjs-app npx prisma generate
docker-compose restart nextjs-app
```

### Permanent Fix (Already Implemented)
The Dockerfile has been updated to auto-generate Prisma Client on container startup:

```dockerfile
# Development stage CMD
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
```

This ensures the Prisma Client is always fresh when the container starts.

### When to Manually Regenerate
Even with the permanent fix, you may need to manually regenerate if:
1. You make schema changes while the container is running
2. You pull schema changes from git
3. You run migrations outside the container

**Solution**: Restart the container to trigger auto-generation:
```bash
docker-compose restart nextjs-app
```

### Verification
Check the logs to confirm Prisma Client was generated successfully:
```bash
docker-compose logs nextjs-app --tail=20
```

Look for:
- `✔ Generated Prisma Client` message
- No "Cannot read properties of undefined" errors
- Successful page compilation

### Prevention Tips
1. **Always restart containers after schema changes**: `docker-compose restart nextjs-app`
2. **Rebuild containers after major changes**: `docker-compose up --build`
3. **Check logs regularly**: `docker-compose logs nextjs-app -f`
4. **Run migrations inside Docker**: `docker-compose exec nextjs-app npx prisma migrate dev`

### Related Issues
- **Build fails**: Ensure Prisma schema is copied before generation in Dockerfile
- **Database connection errors**: Check DATABASE_URL environment variable
- **Migration errors**: Run `docker-compose exec nextjs-app npx prisma migrate deploy`

## Other Docker-Related Prisma Issues

### Issue: "Error: @prisma/client did not initialize yet"
**Solution**: Ensure Prisma Client is generated during build:
```bash
docker-compose up --build
```

### Issue: "Can't reach database server"
**Solution**: Check database container is running and DATABASE_URL is correct:
```bash
docker-compose ps
docker-compose exec nextjs-app env | grep DATABASE_URL
```

### Issue: "Migration lock timeout"
**Solution**: Release the migration lock:
```bash
docker-compose exec postgres psql -U garritwulf_user -d garritwulf_db -c "DELETE FROM _prisma_migrations WHERE migration_name = 'migration_lock';"
```
