# MinIO Subdomain Setup Guide

## 🎯 Purpose

MinIO needs a public subdomain (`minio.garritwulf.com`) so presigned URLs work in user browsers. Without this, uploaded carousel images won't render.

---

## 📋 Prerequisites

- DNS access to `garritwulf.com`
- Nginx Proxy Manager running on VPS
- MinIO container running as `GW-minio` on port 9000

---

## 🚀 Setup Steps

### Step 1: Add DNS A Record

**Go to your domain registrar** (e.g., GoDaddy, Namecheap, Cloudflare)

1. **Navigate to DNS Management** for `garritwulf.com`
2. **Add A Record:**
   ```
   Type:  A
   Host:  minio
   Value: 147.93.105.118
   TTL:   3600 (or Auto)
   ```
3. **Save** and wait 5-10 minutes for propagation

**Verify DNS:**

```bash
nslookup minio.garritwulf.com
# Should return: 147.93.105.118
```

---

### Step 2: Configure Nginx Proxy Manager

**Access NPM:** `http://147.93.105.118:81`

**Login credentials:**

- Email: `farazpawle@gmail.com`
- Password: (your NPM password)

**Add Proxy Host:**

1. **Click:** "Proxy Hosts" → "Add Proxy Host"

2. **Details Tab:**
   - **Domain Names:** `minio.garritwulf.com`
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `GW-minio`
   - **Forward Port:** `9000`
   - **Cache Assets:** ❌ (off)
   - **Block Common Exploits:** ✅
   - **Websockets Support:** ✅

3. **SSL Tab:**
   - **SSL Certificate:** Request a new SSL Certificate
     MinIO needs a public subdomain (`minio.garritwulf.com`) so the Next.js media proxy can reach objects and render carousel images in user browsers.
   - **HTTP/2 Support:** ✅
   - **Email:** `farazpawle@gmail.com`
   - **Agree to Let's Encrypt Terms:** ✅

4. **Click "Save"**

**Expected Result:**

- SSL certificate issued successfully
- Status shows "Online"
- Green indicator next to the proxy host

---

### Step 3: Test MinIO Access

# Test Media Proxy Endpoint:

**From VPS:**

# Stream a file through the public media route

curl -I "http://localhost:3000/api/media/public?key=icons/favicon-1762781849354.ico"

````
# Response should be HTTP/1.1 200 with Cache-Control: public, max-age=31536000, immutable

**Test Presigned URL:**
```bash
# Generate a presigned URL from Next.js container
docker exec GW-nextjs node -e "
const { getPresignedUrl } = require('./src/lib/minio.ts');
getPresignedUrl('icons/favicon-1762781849354.ico', 3600).then(console.log);

---

## 🔧 Code Configuration

The Next.js app is configured to automatically use the MinIO subdomain in production.

**File:** `src/lib/minio.ts`

```typescript
if (isProduction) {
  // Production: Replace container hostnames with public MinIO subdomain
  presignedUrl = presignedUrl.replace(
    "http://GW-minio:9000",
    "https://minio.garritwulf.com",
  );
  presignedUrl = presignedUrl.replace(
    "https://GW-minio:9000",
    "https://minio.garritwulf.com",
  );
  presignedUrl = presignedUrl.replace(
    "http://minio:9000",
    "https://minio.garritwulf.com",
  );
  presignedUrl = presignedUrl.replace(
    "https://minio:9000",
    "https://minio.garritwulf.com",
  );
}
````

**No code changes needed** - this is already in the codebase.

---

## 🔄 After Fresh Install / Reset

**Every time you do a fresh VPS setup:**

1. ✅ **DNS A Record** - Already exists, no action needed (unless you change VPS IP)
2. ✅ **Add MinIO proxy host in NPM** - Takes 2 minutes
3. ✅ **Code** - Already configured

**Quick Checklist:**

- [ ] MinIO container running: `docker ps | grep GW-minio`
- [ ] NPM proxy host created for `minio.garritwulf.com`
- [ ] SSL certificate issued and valid
- [ ] Test presigned URL generation from app

---

## 🐛 Troubleshooting

### Issue: "Internal Error" in NPM

**Cause:** DNS record doesn't exist yet
**Solution:** Add A record first, wait 10 mins, then retry

### Issue: "Access Denied" when accessing MinIO URL

**Cause:** Bucket is private (correct behavior)
**Solution:** This is normal - presigned URLs will work, direct access won't

### Issue: Carousel images still not loading

**Causes:**

1. Presigned URLs not being generated (check Next.js logs)
2. Wrong endpoint in code (should be `https://minio.garritwulf.com`)
3. CORS issues (MinIO proxy should handle this)

**Debug:**

```bash
# Check Next.js logs
docker logs GW-nextjs --tail 50 | grep -i minio

# Test presigned URL generation
docker exec GW-nextjs sh -c "curl http://localhost:3000/api/media/url?key=icons/favicon.ico"
```

### Issue: SSL certificate failed

**Solutions:**

1. Verify DNS propagation: `nslookup minio.garritwulf.com`
2. Check port 80 is accessible (Let's Encrypt needs it)
3. Try manual certificate request in NPM

---

## 📝 Summary

**What MinIO subdomain does:**

- Converts internal URLs (`http://GW-minio:9000`) to public URLs (`https://minio.garritwulf.com`)
- Allows presigned URLs to work from any browser
- Enables secure HTTPS access to uploaded media files

**When you need to set it up:**

- Initial VPS setup
- After complete VPS reset (if NPM data is deleted)
- Never needed if NPM proxy host already exists

**Time required:**

- First time: ~15 minutes (DNS + NPM setup)
- After reset: ~2 minutes (just NPM proxy host)

---

## 🔗 Related Documentation

- [VPS Complete Reset Guide](./VPS-COMPLETE-RESET-GUIDE.md)
- [Deployment Workflow](./.github/copilot-instructions.md#deployment-workflow)
- [MinIO Architecture](../03-Technical-Specs/MINIO-ARCHITECTURE.md)
