# Social Icons Missing in Production (Announcement Bar)

**Problem Category:** Docker Build / Static Rendering Issue  
**Date Resolved:** November 11, 2025  
**Related Files:** `src/app/(public)/layout.tsx`, `src/components/ui/AnnouncementBar.tsx`  
**Symptom:** Social media icons display correctly on localhost but are invisible/missing in production VPS

---

## 🚨 Problem Description

### **Error Symptom:**
- ✅ **Localhost (dev)**: Social icons render correctly in announcement bar
- ❌ **Production (VPS)**: Social icons are missing/invisible in announcement bar
- ✅ All other UI elements load correctly
- ❌ No visible errors in browser console or Docker logs

### **Root Cause:**
The issue stems from the **build-time database guard** implemented to prevent Docker build failures (see `Docker-Build-Database-Access-Error.md`).

During Docker build (`ENV CI=true`):
1. Layout skips database queries and returns empty object: `const contactSettings = isBuildTime ? {} : await getSettings("CONTACT");`
2. Social URLs fallback to empty strings: `const socialFacebook = contactSettings.social_facebook || "";`
3. `AnnouncementBar` component conditionally renders icons only when URLs exist: `{socialFacebook && ( <a>...</a> )}`
4. Next.js pre-renders the page **without icons** during static generation
5. At runtime, even though database has actual URLs, the page is already statically rendered without icon elements

### **Why This Happens:**
- **Contact info** (phone, email) had fallback values during build → rendered correctly
- **Social URLs** had empty fallback values during build → icons excluded from HTML
- The `AnnouncementBar` uses inline SVGs wrapped in conditional rendering
- Once statically rendered without icons, runtime data doesn't re-render the component

---

## 🔍 How to Identify This Problem

### **Symptoms:**
```bash
# Local dev - icons visible
npm run dev
# Visit http://localhost:3000 → Social icons appear ✅

# Production build - icons missing
docker build -t app:latest .
docker run -p 3000:3000 app:latest
# Visit http://localhost:3000 → Social icons missing ❌
```

### **Check These Files:**
1. **`src/app/(public)/layout.tsx`** → Social URL assignment during build time
2. **`src/components/ui/AnnouncementBar.tsx`** → Conditional rendering of icons
3. **`Dockerfile`** → Check if `ENV CI=true` is set

### **Debug Steps:**
```bash
# 1. Check build-time values
echo "CI=true" > .env.local
npm run build
# Look for empty social URLs in build output

# 2. Inspect rendered HTML in production
curl http://production-url.com | grep -A 5 "Social Icons"
# Icons should be present in HTML

# 3. Check if SVG elements exist
# Open browser DevTools → Elements tab
# Search for <svg> within announcement bar section
```

---

## ✅ Solution: Provide Build-Time Fallbacks

The fix ensures social icons are included in the static HTML during build by providing **fallback URLs** when database is unavailable.

### **Step 1: Update Layout with Fallback URLs**

**File:** `src/app/(public)/layout.tsx`

**❌ Before (Broken):**
```tsx
// Fetch contact settings for AnnouncementBar (skip during build)
const contactSettings = isBuildTime ? {} : await getSettings("CONTACT");
const contactPhone = contactSettings.contact_phone || "+971 4 224 38 51";
const contactEmail = contactSettings.contact_email || "sales@garritwulf.com";
const businessHours = contactSettings.business_hours || "Mon - Sat: 8:00 AM - 6:00 PM";
const socialFacebook = contactSettings.social_facebook || ""; // ❌ Empty during build
const socialTwitter = contactSettings.social_twitter || "";   // ❌ Empty during build
const socialInstagram = contactSettings.social_instagram || ""; // ❌ Empty during build
const socialLinkedin = contactSettings.social_linkedin || "";   // ❌ Empty during build
```

**✅ After (Fixed):**
```tsx
// Fetch contact settings for AnnouncementBar (skip during build)
const contactSettings = isBuildTime ? {} : await getSettings("CONTACT");
const contactPhone = contactSettings.contact_phone || "+971 4 224 38 51";
const contactEmail = contactSettings.contact_email || "sales@garritwulf.com";
const businessHours = contactSettings.business_hours || "Mon - Sat: 8:00 AM - 6:00 PM";

// Social media URLs - provide fallback values during build to ensure icons render
const socialFacebook = isBuildTime 
  ? "https://facebook.com/garritwulf"           // ✅ Fallback URL during build
  : (contactSettings.social_facebook || "");
const socialTwitter = isBuildTime 
  ? "https://twitter.com/garritwulf"            // ✅ Fallback URL during build
  : (contactSettings.social_twitter || "");
const socialInstagram = isBuildTime 
  ? "https://instagram.com/garritwulf"          // ✅ Fallback URL during build
  : (contactSettings.social_instagram || "");
const socialLinkedin = isBuildTime 
  ? "https://linkedin.com/company/garritwulf"   // ✅ Fallback URL during build
  : (contactSettings.social_linkedin || "");
```

---

## 🐳 Deployment to Production (VPS)

### **Step 1: Push Changes to GitHub**
```powershell
# On local Windows machine
cd "C:\Users\Faraz\Desktop\GW site - Copy"

git add src/app/(public)/layout.tsx
git commit -m "fix: provide build-time fallbacks for social icons to render in production"
git push origin main
```

### **Step 2: Deploy to VPS**
```bash
# SSH into VPS
ssh root@147.93.105.118 -i C:\Users\Faraz\.ssh\mcp_rsa

# Navigate to project
cd /opt/GarritWulf/app

# Pull latest changes
git pull origin main

# Rebuild Docker image with CI=true (social fallbacks now active)
docker build -t app_nextjs-app:latest .

# Stop and remove old container
docker stop GW-nextjs
docker rm GW-nextjs

# Run new container (use actual credentials from .github/copilot-instructions.md)
docker run -d \
  --name GW-nextjs \
  --network proxy \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://[DB_USER]:[DB_PASS]@GW-postgres:5432/garritwulf_db" \
  -e DIRECT_URL="postgresql://[DB_USER]:[DB_PASS]@GW-postgres:5432/garritwulf_db" \
  -e REDIS_URL="redis://GW-redis:6379" \
  -e MINIO_ENDPOINT="GW-minio" \
  -e MINIO_PORT="9000" \
  -e MINIO_USE_SSL="false" \
  -e MINIO_ACCESS_KEY="[MINIO_KEY]" \
  -e MINIO_SECRET_KEY="[MINIO_SECRET]" \
  -e MINIO_BUCKET_NAME="garritwulf-media" \
  -e NEXT_PUBLIC_API_URL="https://garritwulf.com" \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="[CLERK_PUB_KEY]" \
  -e CLERK_SECRET_KEY="[CLERK_SECRET]" \
  -e CLERK_WEBHOOK_SECRET="[CLERK_WEBHOOK_SECRET]" \
  -e NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in" \
  -e NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up" \
  -e NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/" \
  -e NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/" \
  -e ENCRYPTION_KEY="[YOUR_ENCRYPTION_KEY]" \
  app_nextjs-app:latest

# Verify container is running
docker ps | grep GW-nextjs

# Check logs
docker logs GW-nextjs --tail 50
```

### **Step 3: Verify Fix**
```bash
# Test the website
curl -I https://garritwulf.com
# Should return 200 OK

# Verify social icons are visible
curl https://garritwulf.com | grep -A 10 "Social Icons"
# Should show SVG elements for all 4 platforms

# Check browser
# Open https://garritwulf.com
# Social icons should be visible in announcement bar
```

---

## 🧪 Testing the Fix

### **Local Test (Before Deployment):**
```bash
# Set CI mode to simulate Docker build
export CI=true  # Linux/Mac
set CI=true     # Windows CMD
$env:CI="true"  # Windows PowerShell

# Build with fallback values
npm run build

# Check build output
# Look for: "✓ Generating static pages (X/X)"

# Start production server
npm start

# Verify icons appear
# Open http://localhost:3000
# Announcement bar should show all 4 social icons
```

### **Production Verification:**
```bash
# SSH to VPS
ssh root@147.93.105.118

# Check container logs
docker logs GW-nextjs --tail 100

# Should see:
# ✅ Application initialization complete
# ✅ No build errors
# ✅ Server running on port 3000

# Test endpoint
curl http://localhost:3000 | grep "facebook.com"
# Should return HTML with social icon link
```

---

## 📋 Checklist

When fixing this issue:

- [x] Identify build-time guard causing empty social URLs
- [x] Add fallback social URLs for build phase
- [x] Ensure fallback URLs are realistic (not placeholder text)
- [x] Test local build with `CI=true`
- [x] Verify icons render in local production build
- [x] Push changes to GitHub
- [x] Pull changes on VPS
- [x] Rebuild Docker image
- [x] Deploy new container
- [x] Verify icons visible at https://garritwulf.com
- [x] Verify runtime database values override fallbacks

---

## 🎯 Key Principles

### **Build Time vs Runtime:**
```
┌─────────────────────────────────────────┐
│         DOCKER BUILD PHASE              │
│  (Database NOT available)               │
├─────────────────────────────────────────┤
│  ❌ contactSettings = {}                │
│  ✅ contactPhone = fallback             │
│  ✅ contactEmail = fallback             │
│  ✅ socialFacebook = fallback (NEW)     │
│  ✅ socialTwitter = fallback (NEW)      │
│  ✅ socialInstagram = fallback (NEW)    │
│  ✅ socialLinkedin = fallback (NEW)     │
│                                         │
│  → Icons rendered in static HTML ✅     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         CONTAINER RUNTIME               │
│  (Database available)                   │
├─────────────────────────────────────────┤
│  ✅ contactSettings = { ...database }   │
│  ✅ socialFacebook = actual URL         │
│  ✅ socialTwitter = actual URL          │
│  ✅ socialInstagram = actual URL        │
│  ✅ socialLinkedin = actual URL         │
│                                         │
│  → Real URLs used, icons clickable ✅   │
└─────────────────────────────────────────┘
```

### **Golden Rule:**
> **All visual elements that depend on database data MUST have fallback values during build to ensure they are included in the static HTML.**

---

## 🔗 Related Issues

- **Docker Build Database Access Error:** See `Docker-Build-Database-Access-Error.md`
- **Logo Caching Issue:** Layout revalidation ensures settings update at runtime
- **Static vs Dynamic Rendering:** Build-time guards allow static page generation without database

---

## 🛡️ Prevention

To avoid similar issues in the future:

1. **Always provide fallback values** for any UI elements that depend on database data
2. **Test with `CI=true`** locally before deploying
3. **Verify static HTML** contains all expected elements
4. **Use realistic fallback values** (not empty strings) for conditional rendering
5. **Document build-time behavior** for any database-dependent components

---

## 📚 References

- [Next.js Static vs Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic-rendering)
- [Conditional Rendering in React](https://react.dev/learn/conditional-rendering)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## ✅ Success Indicators

**You've fixed it when:**
1. ✅ `docker build` completes without errors
2. ✅ Local production build shows all 4 social icons
3. ✅ Production VPS shows all 4 social icons
4. ✅ Icons are clickable and link to correct URLs
5. ✅ Actual database URLs override fallback values at runtime
6. ✅ Admin can update social URLs and changes reflect (with revalidation)

---

**Last Updated:** November 11, 2025  
**Tested On:** Next.js 15.5.4, Docker 24.x, Node 18-alpine  
**Production VPS:** 147.93.105.118 (https://garritwulf.com)
