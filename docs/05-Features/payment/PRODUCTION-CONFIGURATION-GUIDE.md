# Production Configuration Guide - Payment Gateway

**Date:** October 12, 2025  
**For:** Garrit & Wulf Auto Parts Website  
**Purpose:** Complete production deployment checklist

---

## 📋 Pre-Deployment Checklist

### Development Complete ✅
- [x] All features implemented (20 files)
- [x] TypeScript compilation: 0 errors
- [x] Unit tests: 28/28 passing
- [x] Integration tests: 9/9 passing
- [x] Security audit: Conditional pass
- [x] Test data created and verified

### Ready for Production ⏳
- [ ] Manual UI testing completed
- [ ] Stripe live mode configured
- [ ] Production environment variables set
- [ ] HTTPS/SSL certificate installed
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Monitoring & alerts set up

---

## 1. Stripe Live Mode Setup

### 1.1 Get Live API Keys

1. **Login to Stripe Dashboard:** https://dashboard.stripe.com
2. **Switch to LIVE MODE** (toggle in top right)
3. **Navigate to:** Developers → API keys
4. **Copy Live Keys:**
   - Publishable key (starts with `pk_live_`)
   - Secret key (starts with `sk_live_`) - Click "Reveal live key token"

⚠️ **CRITICAL:** Never commit live keys to version control!

### 1.2 Create Live Webhook Endpoint

1. **In Stripe Dashboard:** Developers → Webhooks
2. **Click "Add endpoint"**
3. **Endpoint URL:** `https://yourdomain.com/api/webhooks/stripe`
4. **Select Events to Listen to:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. **Click "Add endpoint"**
6. **Copy Webhook Signing Secret:** Starts with `whsec_`

---

## 2. Production Environment Variables

### 2.1 Create Production `.env` File

**Location:** Server root directory (not `.env.local`)

```env
# Database (Production)
DATABASE_URL="postgresql://prod_user:SECURE_PASSWORD@prod-db-host:5432/prod_db?sslmode=require"

# Redis (Production)
REDIS_URL="redis://prod-redis-host:6379"

# Clerk Authentication (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_YOUR_CLERK_PUBLISHABLE_KEY"
CLERK_SECRET_KEY="sk_live_YOUR_CLERK_SECRET_KEY"
CLERK_WEBHOOK_SECRET="whsec_YOUR_CLERK_WEBHOOK_SECRET"

# MinIO/S3 Storage (Production)
MINIO_ENDPOINT="s3.amazonaws.com"  # Or your S3 endpoint
MINIO_PORT="443"
MINIO_REGION="us-east-1"
MINIO_ACCESS_KEY="YOUR_S3_ACCESS_KEY"
MINIO_SECRET_KEY="YOUR_S3_SECRET_KEY"
MINIO_USE_SSL="true"

# Stripe Payment Gateway (LIVE MODE - CRITICAL!)
STRIPE_SECRET_KEY="sk_live_YOUR_ACTUAL_LIVE_SECRET_KEY"
STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_ACTUAL_LIVE_PUBLISHABLE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SIGNING_SECRET"

# Settings Encryption (Generate new 32-byte key for production!)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SETTINGS_ENCRYPTION_KEY="YOUR_NEW_32_BYTE_HEX_KEY_HERE"

# Next.js (Production)
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET_HERE"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"

```

### 2.2 Secure Environment Variables

**If deploying to Vercel:**
```bash
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
# ... repeat for all variables
```

**If deploying to Docker:**
- Use Docker secrets or external secret manager (AWS Secrets Manager, Azure Key Vault)
- Never include secrets in `Dockerfile` or `docker-compose.yml`

**If deploying to VPS:**
- Store in `/etc/environment` or use `systemd` environment files
- Set file permissions: `chmod 600 /path/to/.env`
- Restrict access: `chown root:root /path/to/.env`

---

## 3. Database Configuration

### 3.1 Production Database Setup

```bash
# 1. Create production database (PostgreSQL example)
createdb garritwulf_production

# 2. Run migrations
npx prisma migrate deploy

# 3. Generate Prisma client
npx prisma generate

# 4. Seed settings (if needed)
npx prisma db seed
```

### 3.2 Database Security

- ✅ Enable SSL/TLS connections (`sslmode=require` in DATABASE_URL)
- ✅ Use strong passwords (16+ characters, mixed case, numbers, symbols)
- ✅ Restrict database access to application servers only (firewall rules)
- ✅ Enable automated backups (daily minimum)
- ✅ Set up database monitoring and alerts

---

## 4. HTTPS/SSL Certificate

### 4.1 Obtain SSL Certificate

**Option A: Let's Encrypt (Free)**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Option B: Commercial Certificate**
- Purchase from Namecheap, DigiCert, etc.
- Follow provider's installation instructions

### 4.2 Configure Next.js for HTTPS

**If using Nginx reverse proxy:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 5. Security Headers Configuration

### 5.1 Update `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ... existing config ...
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 6. Rate Limiting Implementation

### 6.1 Install Rate Limiting Middleware

```bash
npm install express-rate-limit
```

### 6.2 Create Rate Limiter

**File:** `src/lib/rate-limit.ts`

```typescript
import rateLimit from 'express-rate-limit';

export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many payment requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const refundRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute
  message: 'Too many refund requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 6.3 Apply to API Routes

Update API routes to use rate limiters (implementation depends on your setup).

---

## 7. Monitoring & Alerts

### 7.1 Stripe Dashboard Alerts

1. **Go to:** Stripe Dashboard → Settings → Emails
2. **Enable notifications for:**
   - Payment failures (>5% failure rate)
   - Webhook endpoint failures
   - Disputes and chargebacks
   - Large transactions (set threshold)

### 7.2 Application Monitoring

**Recommended Tools:**
- **Error Tracking:** Sentry (https://sentry.io)
- **Uptime Monitoring:** UptimeRobot (https://uptimerobot.com)
- **Performance:** New Relic or DataDog
- **Logs:** LogDNA or Papertrail

**Setup Example (Sentry):**
```bash
npm install @sentry/nextjs

npx @sentry/wizard@latest -i nextjs
```

### 7.3 Database Monitoring

- Set up automated backups (daily minimum, 30-day retention)
- Configure disk space alerts (<20% free)
- Monitor query performance
- Set up connection pool alerts

---

## 8. Build & Deployment

### 8.1 Build for Production

```bash
# Install dependencies
npm ci  # Use ci for production (faster, reproducible)

# Build Next.js application
npm run build

# Test production build locally
npm run start
```

### 8.2 Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables (see Section 2.2)
```

### 8.3 Deploy to VPS (Docker)

```bash
# Build Docker image
docker build -t garritwulf-app .

# Run container
docker run -d \
  --name garritwulf-app \
  --env-file .env.production \
  -p 3000:3000 \
  garritwulf-app

# Or use docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### 8.4 Deploy to VPS (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "garritwulf" -- start

# Save PM2 process list
pm2 save

# Set up PM2 to restart on reboot
pm2 startup
```

---

## 9. Post-Deployment Verification

### 9.1 Smoke Tests (30 minutes)

1. **HTTPS Working:**
   - [ ] Visit https://yourdomain.com (no SSL warnings)
   - [ ] Check mixed content warnings (inspect console)

2. **Payment Flow Test:**
   - [ ] Create test order (use Stripe test cards in **live mode test**)
   - [ ] Verify payment intent created
   - [ ] Complete payment
   - [ ] Check webhook received
   - [ ] Verify order status updated

3. **Admin Dashboard:**
   - [ ] Login as ADMIN
   - [ ] Access `/admin/payments`
   - [ ] View payment details
   - [ ] Test search and filters
   - [ ] Test CSV export

4. **Refund Flow:**
   - [ ] Process test refund (small amount: $1.00)
   - [ ] Verify refund in Stripe Dashboard
   - [ ] Check webhook received
   - [ ] Verify payment status updated

5. **Security:**
   - [ ] Test unauthorized access (should redirect to login)
   - [ ] Verify HTTPS everywhere
   - [ ] Check security headers (use securityheaders.com)

### 9.2 Monitor for 48 Hours

- Watch Stripe Dashboard for payment activity
- Monitor server logs for errors
- Check webhook delivery status
- Verify database connections stable
- Monitor application uptime

---

## 10. Rollback Plan

### If Critical Issue Found:

**Option 1: Disable Payment System**
```typescript
// In src/lib/payments/settings.ts
export const PAYMENTS_ENABLED = false;  // Temporarily disable
```

**Option 2: Rollback Deployment**
```bash
# Vercel
vercel rollback

# Docker
docker-compose down
docker-compose -f docker-compose.previous.yml up -d

# PM2
pm2 stop garritwulf
# Deploy previous version
pm2 start garritwulf
```

**Option 3: Switch Back to Test Mode**
- Update Stripe keys to test mode
- Notify users of maintenance

---

## 11. Ongoing Maintenance

### Daily
- Check Stripe Dashboard for payment failures
- Review webhook logs for errors

### Weekly
- Review security logs
- Check system performance metrics
- Update dependencies (`npm audit fix`)

### Monthly
- Review refund requests and patterns
- Analyze payment success rate
- Check for Stripe API updates

### Quarterly
- Run security audit
- Review and update PCI DSS compliance
- Test disaster recovery procedures
- Update dependencies to latest stable versions

---

## 📊 Production Checklist Summary

| Task | Status | Notes |
|------|--------|-------|
| Stripe Live Keys Configured | ⬜ | See Section 1.1 |
| Live Webhook Endpoint Created | ⬜ | See Section 1.2 |
| Production .env File Created | ⬜ | See Section 2.1 |
| Environment Variables Secured | ⬜ | See Section 2.2 |
| Database Migrated | ⬜ | See Section 3.1 |
| Database Backups Configured | ⬜ | See Section 3.2 |
| SSL Certificate Installed | ⬜ | See Section 4 |
| Security Headers Configured | ⬜ | See Section 5 |
| Rate Limiting Implemented | ⬜ | See Section 6 |
| Monitoring Set Up | ⬜ | See Section 7 |
| Application Built | ⬜ | See Section 8.1 |
| Application Deployed | ⬜ | See Section 8.2-8.4 |
| Smoke Tests Completed | ⬜ | See Section 9.1 |
| 48-Hour Monitoring | ⬜ | See Section 9.2 |

---

## 🎯 Launch Decision Criteria

**GO/NO-GO Decision:** System is ready for production if:
- ✅ All checklist items completed
- ✅ Smoke tests passed
- ✅ No critical issues found in 48-hour monitoring
- ✅ Backup and rollback plans tested
- ✅ Team trained on monitoring and incident response

**Sign-Off:**
- Technical Lead: _________________
- Security Lead: _________________
- Business Owner: _________________

---

**Document Version:** 1.0  
**Last Updated:** October 12, 2025  
**Next Review:** After first production payment
