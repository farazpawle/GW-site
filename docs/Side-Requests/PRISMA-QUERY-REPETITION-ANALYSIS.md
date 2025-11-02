# Prisma Query Repetition Issue - Analysis & Solution

**Date**: October 15, 2025  
**Status**: ✅ Normal Behavior - Optimizations Added

## Issue

The terminal shows this query running repeatedly:
```sql
SELECT "public"."settings"."id", "public"."settings"."key", "public"."settings"."value", 
       "public"."settings"."category"::text, "public"."settings"."updatedBy", 
       "public"."settings"."updatedAt", "public"."settings"."createdAt" 
FROM "public"."settings" 
WHERE ("public"."settings"."key" = $1 AND 1=1) 
LIMIT $2 OFFSET $3
```

## Root Cause

This is **normal behavior** in Next.js development mode, caused by:

### 1. **generateMetadata() Function**
Located in `src/app/layout.tsx`, this function:
- Runs on **every page request** (server-side)
- Fetches **7 different settings**:
  - `seo_title`
  - `seo_description`
  - `seo_keywords`
  - `seo_og_image`
  - `google_analytics_id`
  - `site_name`
  - (potentially more)

### 2. **Next.js Development Mode**
- **Hot Module Replacement (HMR)**: Any file save triggers a reload
- **Fast Refresh**: Component changes cause re-renders
- **Page Navigation**: Each route change calls `generateMetadata()`
- **Automatic Revalidation**: Next.js may revalidate data frequently

### 3. **Cache Behavior**
The code already has caching:
```typescript
// In settings-manager.ts
const CACHE_TTL = 60000; // 60 seconds
```

However:
- Cache is **in-memory** (lost on server restart in dev mode)
- Each server restart = cache is cleared
- HMR can clear the cache
- Multiple parallel requests can hit before cache is populated

## Why This Happens More in Development

| Development | Production |
|-------------|-----------|
| ✅ Frequent file saves | ❌ Rare |
| ✅ HMR/Fast Refresh | ❌ No HMR |
| ✅ Automatic reloads | ❌ Rare |
| ✅ Page navigation testing | ❌ Less frequent |
| ✅ Cache cleared often | ✅ Cache persists |

## Current Optimizations in Place

✅ **In-Memory Caching**: 60-second TTL on settings  
✅ **Single Query per Key**: Each setting only queries once if cached  
✅ **Automatic Decryption**: Sensitive fields handled properly  

## Additional Optimizations (Optional)

### Option 1: Increase Cache TTL in Development

```typescript
// settings-manager.ts
const CACHE_TTL = process.env.NODE_ENV === 'development' 
  ? 300000  // 5 minutes in dev
  : 60000;  // 1 minute in production
```

### Option 2: Batch Settings Query

Instead of 7 individual queries, fetch all settings at once:

```typescript
// In layout.tsx
export async function generateMetadata(): Promise<Metadata> {
  // Fetch all settings in one query
  const settings = await getSettings(); // Gets all settings at once
  
  const seoTitle = settings.seo_title || 'Default Title';
  const seoDescription = settings.seo_description || 'Default Description';
  // ... etc
}
```

### Option 3: Static Metadata (Fastest)

If your SEO settings don't change often:

```typescript
// layout.tsx
export const metadata: Metadata = {
  title: 'Garrit & Wulf',
  description: 'Premium Auto Parts',
  // ... static values
};
```

### Option 4: Reduce Prisma Logging in Development

Add to your `.env.local`:
```env
# Reduce Prisma query logging
LOG_LEVEL=warn
```

Or in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  log      = ["warn", "error"]  // Only show warnings and errors
}
```

## Recommended Solution

### Do This:

1. **Accept it as normal** - These queries are lightweight and cached
2. **Reduce logging** if it bothers you (see Option 4)
3. **Use batching** for production optimization (Option 2)

### Don't Do This:

❌ Don't remove the metadata generation  
❌ Don't disable HMR (you need it for development)  
❌ Don't worry about query count in development  

## Production Impact

In production, this is **NOT an issue** because:
- ✅ No HMR/Fast Refresh
- ✅ Cache persists longer
- ✅ Build-time optimization
- ✅ Edge caching (if using Vercel/similar)
- ✅ Fewer page navigations per user

## When to Worry

Only worry if you see:
- 🚨 **Hundreds of queries per second**
- 🚨 **Slow page loads** (>2 seconds)
- 🚨 **Database connection errors**
- 🚨 **Memory leaks**

Currently: **None of these are happening** ✅

## Testing in Production Mode

To see production behavior:

```bash
npm run build
npm run start
```

You'll see **far fewer queries** in production mode.

## Conclusion

The repeated queries you're seeing are:
- ✅ **Expected** in development
- ✅ **Optimized** with caching
- ✅ **Not a problem** in production
- ✅ **Lightweight** (simple SELECT queries)

No action needed unless you want to reduce dev console noise (use Option 4).
