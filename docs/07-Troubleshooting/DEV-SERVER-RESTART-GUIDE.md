# Development Workflow Guide

## ⚠️ IMPORTANT: When Database Schema Changes

Whenever you make changes to `prisma/schema.prisma`, you MUST follow these steps:

### Quick Fix (Use the Batch File)
```bash
# Windows
./restart-dev.bat

# This automatically:
# 1. Stops all Node processes
# 2. Regenerates Prisma Client
# 3. Clears Next.js cache
# 4. Starts dev server
```

### Manual Steps (If batch file doesn't work)
```bash
# 1. Stop the dev server
Press Ctrl+C in the terminal running npm run dev

# 2. Kill any remaining Node processes
# Windows PowerShell:
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 3. Regenerate Prisma Client
npx prisma generate

# 4. Apply database migrations (if schema changed)
npx prisma migrate dev --name describe_your_change

# 5. Clear Next.js cache (optional but recommended)
# Windows:
rmdir /s /q .next

# 6. Restart dev server
npm run dev
```

## Why This Happens

When you change the database schema (add/remove fields like SKU):

1. **Prisma Client is out of sync** - It's generated code that needs to be regenerated
2. **TypeScript types are outdated** - The types for your models don't match the code
3. **Dev server caches old code** - Next.js caches compiled code
4. **Node processes can hang** - The dev server doesn't always stop cleanly

## Common Errors and Solutions

### Error: "Property 'sku' does not exist"
**Cause**: Prisma Client not regenerated after adding SKU field
**Solution**: Run `restart-dev.bat` or manually regenerate Prisma

### Error: "EPERM: operation not permitted"
**Cause**: Dev server is still running and locking Prisma files
**Solution**: Kill all Node processes first, then regenerate

### Error: "Exit Code: 1"
**Cause**: TypeScript compilation errors from outdated Prisma types
**Solution**: Follow the full restart workflow

## Automated NPM Scripts

Add these to your `package.json` for easier workflow:

```json
{
  "scripts": {
    "dev:clean": "npx kill-port 3000 && npx prisma generate && npm run dev",
    "reset:prisma": "npx prisma generate && npx prisma migrate dev",
    "kill:node": "taskkill /F /IM node.exe /T || true"
  }
}
```

Then you can just run:
```bash
npm run dev:clean
```

## Best Practices to Avoid This

1. **Always regenerate Prisma after schema changes**
   ```bash
   npx prisma generate
   ```

2. **Use migrations for database changes**
   ```bash
   npx prisma migrate dev --name add_sku_field
   ```

3. **Stop server before schema changes**
   - Make changes
   - Stop server
   - Regenerate Prisma
   - Restart server

4. **Use the batch file** (`restart-dev.bat`)
   - Handles everything automatically
   - Prevents common errors
   - Saves time

## Quick Reference

| Problem | Command |
|---------|---------|
| Schema changed | `restart-dev.bat` |
| Server won't start | Kill Node → Generate → Start |
| Type errors | `npx prisma generate` |
| Database out of sync | `npx prisma migrate dev` |
| Cache issues | Delete `.next` folder |

## Emergency Reset

If everything is broken:

```bash
# Windows (run in PowerShell as Admin)
# 1. Kill all Node
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Clean everything
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item node_modules\.prisma -Recurse -Force -ErrorAction SilentlyContinue

# 3. Regenerate
npx prisma generate

# 4. Start fresh
npm run dev
```

---

**Remember**: Always use `restart-dev.bat` when you change the database schema!
