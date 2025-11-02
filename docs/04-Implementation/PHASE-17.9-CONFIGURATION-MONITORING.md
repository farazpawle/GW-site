# Phase 17.9: Configuration & Monitoring (Simplified for Showcase Site)

**Status:** Planning  
**Priority:** Low-Medium  
**Start Date:** When needed  
**Estimated Duration:** 2-3 days  
**Parent Phase:** Phase 17 - Comprehensive System Improvements  

---

## What's Needed vs. What's Overkill

### ✅ Worth Doing (2-3 Days)
1. **Environment variable validation** - Catch missing configs early
2. **React Error Boundaries** - Prevent white screens
3. **Health check endpoint** - Deployment verification

### ❌ Skip (Enterprise Overkill for Showcase)
- Sentry monitoring ($$$ subscription)
- Feature flags system (unnecessary complexity)
- Pino structured logging (overkill)
- Complex alerting/dashboards (not needed)
- Application metrics (unnecessary)

---

## Implementation Tasks

### Task 1: Environment Variable Validation - 1 Day

**File:** `src/lib/env.ts`  
**Purpose:** Validate all required env vars at startup  

```typescript
// Throw error if missing required variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

requiredEnvVars.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
});
```

**Update:** `.env.example` with all variables documented
   NODE_ENV="development"
   LOG_LEVEL="debug"
   
   # Feature Flags
   FEATURE_REVIEWS_ENABLED="true"
   FEATURE_WISHLIST_ENABLED="false"
   ```
   - Add comments explaining each variable
   - Include example values

3. **Enhanced Environment Validation (Day 1-2)**
   - Update: `src/lib/env.ts` (from Phase 17.1)
   - Add type-safe environment object
   ```typescript
   import { z } from 'zod';
   
   const envSchema = z.object({
     // Database
     DATABASE_URL: z.string().url(),
     
     // Auth
     NEXTAUTH_SECRET: z.string().min(32),
     NEXTAUTH_URL: z.string().url(),
     
     // Redis
     REDIS_URL: z.string().url().optional(),
     
     // MinIO
     MINIO_ENDPOINT: z.string(),
     MINIO_PORT: z.string(),
     MINIO_ACCESS_KEY: z.string(),
     MINIO_SECRET_KEY: z.string(),
     MINIO_USE_SSL: z.enum(['true', 'false']),
     MINIO_BUCKET: z.string(),
     
     // Algolia
     ALGOLIA_APP_ID: z.string().optional(),
     ALGOLIA_ADMIN_KEY: z.string().optional(),
     ALGOLIA_SEARCH_KEY: z.string().optional(),
     
     // Email
     SMTP_HOST: z.string(),
     SMTP_PORT: z.string(),
     SMTP_USER: z.string().email(),
     SMTP_PASS: z.string(),
     EMAIL_FROM: z.string().email(),
     
     // Monitoring
     SENTRY_DSN: z.string().url().optional(),
     

### Task 2: React Error Boundaries - 1 Day

**File:** `src/components/ErrorBoundary.tsx`  
**Purpose:** Catch React errors and show friendly fallback  
**Benefit:** Prevents white screen, shows "Something went wrong" message

```typescript
'use client';

export class ErrorBoundary extends React.Component {
  // Catches errors in child components
  // Shows fallback UI instead of crashing
}
```

**Also create:** Product-specific and cart-specific error boundaries

### Task 3: Health Check Endpoint - Half Day

**File:** `src/app/api/health/route.ts`  
**Purpose:** Simple endpoint to verify app is running  
**Usage:** Deployment verification, monitoring

```typescript
export async function GET() {
  // Check database connection
  // Return { status: 'healthy' } or 503
}
```

---

## Acceptance Criteria

- [ ] Env validation throws clear errors for missing variables
- [ ] `.env.example` documents all variables
- [ ] ErrorBoundary catches runtime errors
- [ ] Health endpoint returns 200 when healthy
- [ ] Health endpoint checks database connection

---

**Last Updated:** November 1, 2025  
**Status:** Simplified for showcase site
