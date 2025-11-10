# Social Icons Missing on VPS - Troubleshooting Guide

**Issue**: Social media icons visible on localhost but missing on VPS production site.

---

## 🔍 Root Cause Analysis

The issue is caused by **stale settings cache** on the VPS. The Next.js application uses an in-memory cache with 60-second TTL for settings data. After deployment or database changes, the cache may contain outdated values.

### Architecture Involved:
- **File**: `src/lib/settings/settings-manager.ts`
- **Cache**: In-memory Map with 60s TTL
- **Data Flow**: Database → Cache → layout.tsx → Header → AnnouncementBar

### Why It Works Locally but Not on VPS:
1. **Local**: Fresh cache after each restart during development
2. **VPS**: Long-running container with stale cache from before social URLs were added

---

## ✅ Solution: Clear Cache by Restarting Container

### Quick Fix (30 seconds):
```bash
# SSH into VPS
ssh root@147.93.105.118 -i C:\Users\Faraz\.ssh\mcp_rsa

# Restart the Next.js container
docker restart GW-nextjs

# Wait 10 seconds
sleep 10

# Verify
curl -s https://garritwulf.com | grep -o 'facebook.com/garritwulf'
```

**Expected Output**: Should show the Facebook URL if icons are rendering.

---

## 🔬 Diagnostic Scripts

### Option 1: PowerShell Test from Windows (Recommended)
```powershell
# Run from project root
.\scripts\test-vps-social-icons.ps1
```

**What it checks**:
- ✅ Database values on VPS
- ✅ Docker container status
- ✅ Container logs for errors
- ✅ Live website HTML for social icons

### Option 2: Bash Script on VPS (Full Diagnostic + Fix)
```bash
# SSH into VPS first
ssh root@147.93.105.118 -i C:\Users\Faraz\.ssh\mcp_rsa

# Navigate to project
cd /opt/GarritWulf/app

# Run the fix script
bash scripts/fix-social-icons-vps.sh
```

**What it does**:
1. Checks database for social URLs
2. Restarts container (clears cache)
3. Tests settings API endpoint
4. Verifies HTML output
5. Provides diagnostic summary

---

## 🧪 Manual Testing Steps

### 1. Verify Database Has Values
```bash
# On VPS
docker exec GW-postgres psql -U garritwulf_user -d garritwulf_db -c \
  "SELECT key, value FROM \"Settings\" WHERE key LIKE 'social_%' ORDER BY key;"
```

**Expected Output**:
```
         key         |                 value                  
---------------------+---------------------------------------
 social_facebook     | https://www.facebook.com/garritwulf
 social_instagram    | https://instagram.com/garritwulf
 social_linkedin     | https://linkedin.com/company/garritwulf
 social_twitter      | https://twitter.com/garritwulf
```

### 2. Check Settings API Endpoint
```bash
# Test settings retrieval
curl -s http://localhost:3000/api/admin/settings?category=CONTACT | grep social
```

**Expected Output**: Should show JSON with social URLs.

### 3. Inspect Live HTML
```bash
# Check if icons are in rendered HTML
curl -s https://garritwulf.com | grep -E 'facebook|twitter|instagram|linkedin'
```

**Expected Output**: Should see anchor tags with social URLs.

---

## 📊 Code Flow Analysis

### Data Flow Path:
```
Database (Settings table)
    ↓
settings-manager.ts (getSettings function with cache)
    ↓
layout.tsx (server-side fetch with revalidate: 60)
    ↓
Header component (props)
    ↓
AnnouncementBar component (conditional render)
```

### Cache Logic:
```typescript
// From settings-manager.ts
const CACHE_TTL = 60000; // 60 seconds

function isCacheValid(entry: CacheEntry | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}
```

### Conditional Rendering:
```tsx
// From AnnouncementBar.tsx
{socialFacebook && (
  <a href={socialFacebook}>...</a>
)}
```

**Issue**: If `socialFacebook` is empty string `""`, the icon won't render even though database has value.

---

## 🚨 Common Causes & Fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Icons missing after deployment | Stale cache | `docker restart GW-nextjs` |
| Icons missing after DB update | Cache not invalidated | Wait 60s or restart |
| Icons visible on some pages only | Different revalidation times | Set consistent `revalidate` |
| Empty strings in props | Database empty | Add values via admin panel |
| Database has values but props empty | DATABASE_URL misconfigured | Check env vars |

---

## 🔧 Prevention

### 1. Cache Invalidation Strategy
Add explicit cache clearing on settings update:

```typescript
// In settings-manager.ts
export function clearSettingsCache(category?: SettingsCategory) {
  if (category) {
    settingsCache.delete(category);
  } else {
    settingsCache.clear();
  }
}
```

### 2. Add Cache-Busting to Settings API
```typescript
// In route handler
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

### 3. Use Redis for Distributed Cache
Replace in-memory cache with Redis to sync across container restarts:
```typescript
import { redis } from '@/lib/redis';
const cached = await redis.get(`settings:${category}`);
```

---

## 📝 Related Files

| File | Purpose |
|------|---------|
| `src/lib/settings/settings-manager.ts` | Settings cache & retrieval logic |
| `src/app/(public)/layout.tsx` | Fetches settings server-side |
| `src/components/ui/AnnouncementBar.tsx` | Renders social icons |
| `src/app/api/admin/settings/route.ts` | Settings API endpoint |
| `scripts/check-social-settings.ts` | Database diagnostic script |
| `scripts/diagnose-social-settings.ts` | Comprehensive local test |
| `scripts/test-vps-social-icons.ps1` | Remote VPS testing |
| `scripts/fix-social-icons-vps.sh` | Automated VPS fix |

---

## ✅ Verification Checklist

After applying fix:

- [ ] Database has all 4 social URLs
- [ ] Container restarted successfully
- [ ] Settings API returns social URLs
- [ ] Homepage HTML contains social links
- [ ] Icons visible in browser (clear browser cache)
- [ ] Icons clickable and link to correct profiles
- [ ] Mobile responsive (icons visible on small screens)

---

## 🔗 Quick Reference

**Live Site**: https://garritwulf.com  
**Admin Panel**: https://garritwulf.com/admin/settings  
**VPS SSH**: `ssh root@147.93.105.118 -i C:\Users\Faraz\.ssh\mcp_rsa`  
**Container Name**: `GW-nextjs`  
**Database Container**: `GW-postgres`

---

**Last Updated**: January 2025  
**Status**: ✅ Resolved via cache invalidation
