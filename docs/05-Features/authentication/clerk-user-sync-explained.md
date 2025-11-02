# Clerk User Sync Explained

## How It Works

### Without Webhook (Current State):
```
┌─────────────────────────────────────────────────────┐
│  Clerk Dashboard (Cloud)                            │
│  - Users stored here                                │
│  - Sign up/in happens here                          │
└─────────────────────────────────────────────────────┘
                      ❌ No connection
┌─────────────────────────────────────────────────────┐
│  Your PostgreSQL (Local)                            │
│  - Users NOT automatically synced                   │
│  - Must run scripts manually                        │
└─────────────────────────────────────────────────────┘
```

**Result:** Manual sync required using scripts

---

### With Webhook (After Setup):
```
┌─────────────────────────────────────────────────────┐
│  Clerk Dashboard (Cloud)                            │
│  - User signs up ──────────┐                        │
│  - User updates profile ───┼───→ Webhook Event      │
│  - User deleted ───────────┘                        │
└─────────────────────────────────────────────────────┘
                      ✅ Automatic
                         ↓
┌─────────────────────────────────────────────────────┐
│  Your API: /api/webhooks/clerk                      │
│  - Receives event                                   │
│  - Verifies signature                               │
│  - Updates database                                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  Your PostgreSQL (Local)                            │
│  - Users automatically synced                       │
│  - Always up to date                                │
└─────────────────────────────────────────────────────┘
```

**Result:** Fully automatic sync!

---

## Current Workflow (No Webhook)

### When User Signs Up:
1. User signs up via Google/Email
2. ✅ User saved in Clerk
3. ❌ User NOT in your database
4. **Manual fix:** Run `npm run clerk:sync`

### When User Updates Profile:
1. User changes name/email in Clerk
2. ✅ Updated in Clerk
3. ❌ NOT updated in your database
4. **Manual fix:** Run `npm run clerk:sync`

### When User Gets Deleted:
1. You delete user from Clerk dashboard
2. ✅ Deleted from Clerk
3. ❌ Still in your database (orphaned record)
4. **Manual fix:** Run `npm run clerk:cleanup`

---

## After Webhook Setup

### When User Signs Up:
1. User signs up via Google/Email
2. ✅ User saved in Clerk
3. ✅ Webhook fires → User automatically created in database
4. **No action needed!**

### When User Updates Profile:
1. User changes name/email
2. ✅ Updated in Clerk
3. ✅ Webhook fires → Database automatically updated
4. **No action needed!**

### When User Gets Deleted:
1. You delete user from Clerk
2. ✅ Deleted from Clerk
3. ✅ Webhook fires → Database automatically deletes user
4. **No action needed!**

---

## Manual Scripts (For Now)

### Sync New/Updated Users
```bash
npm run clerk:sync
```

**What it does:**
- Fetches all users from Clerk
- Compares with your database
- Creates missing users
- Skips users that already exist

**When to use:**
- After signing up new users
- After manually creating users in Clerk
- To ensure database is in sync

---

### Clean Up Deleted Users
```bash
npm run clerk:cleanup
```

**What it does:**
- Fetches all users from Clerk
- Finds users in database that don't exist in Clerk
- Deletes orphaned users from database

**When to use:**
- After deleting users from Clerk
- To remove old/test accounts
- Before deploying to production

---

## Setting Up the Webhook

See `docs/clerk-webhook-setup.md` for full instructions.

**Quick Steps:**

1. **Expose your local server:**
   ```bash
   # Install ngrok: https://ngrok.com/download
   ngrok http 3000
   ```

2. **Go to Clerk Dashboard:**
   - Navigate to Webhooks
   - Click "+ Add Endpoint"

3. **Configure webhook:**
   - **URL:** `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - **Events:** Select `user.created`, `user.updated`, `user.deleted`
   - **Copy signing secret**

4. **Add secret to .env.local:**
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_secret_here
   ```

5. **Restart dev server:**
   ```bash
   npm run dev
   ```

6. **Test:**
   - Sign up with a new test account
   - Check Prisma Studio → User should appear automatically!

---

## Webhook Endpoint Details

**Location:** `src/app/api/webhooks/clerk/route.ts`

**Security:**
- ✅ Signature verification using Svix
- ✅ Only accepts POST requests
- ✅ Public route (not protected by authentication)
- ✅ Validates all incoming data

**Supported Events:**
- `user.created` → Creates user in database
- `user.updated` → Updates user email/name
- `user.deleted` → Removes user from database

**Error Handling:**
- Invalid signature → 400 Bad Request
- Missing webhook secret → 500 Internal Server Error
- Database errors → 500 with error details logged

---

## Production Setup

When deploying to production:

1. **Update webhook URL** in Clerk dashboard:
   ```
   https://your-production-domain.com/api/webhooks/clerk
   ```

2. **Keep same signing secret** (already in production env)

3. **No more manual scripts needed!**

---

## Troubleshooting

### Users not syncing after webhook setup

**Check webhook logs in Clerk:**
1. Go to Clerk Dashboard → Webhooks
2. Click your endpoint
3. Check "Logs" tab
4. Look for failed deliveries

**Common issues:**
- ❌ Wrong signing secret → Fix in `.env.local`
- ❌ Endpoint not accessible → Check ngrok is running
- ❌ Middleware blocking webhook → Check `src/middleware.ts`

### Manual sync script fails

**Error: "Missing Clerk Secret Key"**
```bash
# Run with explicit env var
$env:CLERK_SECRET_KEY = "your_secret_key"
npm run clerk:sync
```

**Error: "Database connection failed"**
```bash
# Check Docker containers are running
docker ps

# Restart if needed
npm run docker:dev
```

---

## Migration Path

**Phase 1 (Current):** Manual scripts
- ✅ Working but requires manual intervention
- ✅ Good for initial setup and testing

**Phase 2 (Next):** Webhook setup for local dev
- ✅ Automatic sync during development
- ✅ Requires ngrok or similar tunnel

**Phase 3 (Production):** Full automation
- ✅ Completely hands-off
- ✅ Production-ready webhook endpoint

---

**Status:** 📍 Phase 1 - Manual sync via scripts  
**Next Step:** Set up webhook for automatic sync  
**Guide:** See `docs/clerk-webhook-setup.md`
