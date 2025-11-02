# Stripe Setup Guide for Local Development

**Generated:** October 12, 2025  
**Purpose:** Complete Stripe test environment setup for payment gateway testing

---

## Prerequisites

- Stripe account (create free at https://stripe.com)
- Windows PowerShell
- Project running on localhost:3000

---

## Step 1: Get Stripe Test API Keys

### 1.1 Login to Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Make sure you're in **TEST MODE** (toggle in top right should say "Test mode")

### 1.2 Get Your API Keys
1. Navigate to: **Developers** → **API keys**
2. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

### 1.3 Update .env.local
Replace the placeholder values in `.env.local`:

```env
# Stripe Payment Gateway (Phase 11)
STRIPE_SECRET_KEY="sk_test_YOUR_ACTUAL_SECRET_KEY_HERE"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_test_placeholder"  # Update after Step 2
```

**⚠️ IMPORTANT:** Never commit real API keys to version control!

---

## Step 2: Install Stripe CLI

### 2.1 Download Stripe CLI for Windows

**Option A: Direct Download (Recommended)**
1. Visit https://github.com/stripe/stripe-cli/releases/latest
2. Download `stripe_X.X.X_windows_x86_64.zip`
3. Extract to a folder (e.g., `C:\stripe\`)
4. Add to Windows PATH:
   ```powershell
   # Run PowerShell as Administrator
   $env:Path += ";C:\stripe"
   # Make permanent:
   [Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
   ```

**Option B: Using Scoop (If you have Scoop installed)**
```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### 2.2 Verify Installation
```powershell
stripe --version
# Should output: stripe version X.X.X
```

---

## Step 3: Authenticate Stripe CLI

```powershell
# Login to your Stripe account
stripe login

# This will:
# 1. Open your browser
# 2. Ask you to confirm access
# 3. Generate a CLI key
# 4. Store credentials locally
```

**Verification:**
```powershell
stripe config --list
# Should show your configured keys
```

---

## Step 4: Set Up Webhook Forwarding

### 4.1 Start Webhook Listener
Open a **new terminal** window and run:

```powershell
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

**Output should show:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx...
```

### 4.2 Copy Webhook Secret
1. Copy the `whsec_...` value from the output
2. Update `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_YOUR_ACTUAL_WEBHOOK_SECRET"
   ```

### 4.3 Restart Dev Server
```powershell
# Stop current dev server (Ctrl+C)
npm run dev
```

**Keep the `stripe listen` terminal open** while testing!

---

## Step 5: Test Webhook Integration

### 5.1 Trigger Test Events
In a **third terminal** window:

```powershell
# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded
```

### 5.2 Verify Webhooks Received
Check the `stripe listen` terminal - you should see:
```
2025-10-12 10:30:45  --> payment_intent.succeeded [evt_xxxxx]
2025-10-12 10:30:47  <--  [200] POST http://localhost:3000/api/webhooks/stripe
```

### 5.3 Check Database
```powershell
npx prisma studio
```

Navigate to **WebhookLog** table - you should see logged events!

---

## Step 6: Create Test Payment

### 6.1 Use Stripe Test Cards

When testing checkout flows, use these test cards:

| Card Number | Description | CVV | Exp Date |
|------------|-------------|-----|----------|
| `4242 4242 4242 4242` | Successful payment | Any | Any future |
| `4000 0000 0000 0002` | Declined card | Any | Any future |
| `4000 0000 0000 9995` | Insufficient funds | Any | Any future |
| `4000 0025 0000 3155` | Requires 3D Secure | Any | Any future |

### 6.2 Test via API

```powershell
# In PowerShell, test payment intent creation:
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    orderId = "test-order-id"
    amount = 5000  # $50.00 in cents
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/payments/create-intent" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

---

## Step 7: Verify Everything Works

### 7.1 Checklist
- [ ] Stripe CLI installed and authenticated
- [ ] API keys in `.env.local`
- [ ] Webhook secret in `.env.local`
- [ ] `stripe listen` running in terminal
- [ ] Dev server running with updated env vars
- [ ] Test webhook events received
- [ ] WebhookLog table has entries
- [ ] No errors in console

### 7.2 Test Admin UI
1. Navigate to http://localhost:3000/admin/payments
2. You should see the payments list page
3. If you triggered test events, payments may appear (depending on order setup)

---

## Troubleshooting

### Issue: "stripe: command not found"
**Solution:** Stripe CLI not in PATH. Re-run Step 2.1 or restart PowerShell.

### Issue: "Invalid API key"
**Solution:** 
1. Make sure you're in TEST mode in Stripe dashboard
2. Keys must start with `sk_test_` and `pk_test_`
3. Restart dev server after updating `.env.local`

### Issue: "Webhook signature verification failed"
**Solution:**
1. Make sure `STRIPE_WEBHOOK_SECRET` matches output from `stripe listen`
2. Restart dev server after updating
3. Restart `stripe listen` if needed

### Issue: "Events not appearing in database"
**Solution:**
1. Check `stripe listen` terminal for errors
2. Check Next.js terminal for API errors
3. Verify webhook endpoint is accessible: http://localhost:3000/api/webhooks/stripe
4. Check WebhookLog table in Prisma Studio

### Issue: "Cannot connect to Stripe"
**Solution:**
1. Check internet connection
2. Verify firewall isn't blocking Stripe
3. Try: `stripe status` to check Stripe's API status

---

## Next Steps After Setup

Once Stripe is configured:

1. **Create Test Data** → Run seed script to populate payments
2. **Manual UI Testing** → Test all admin payment features
3. **Write Unit Tests** → Test payment logic
4. **Security Audit** → Verify webhook signatures, encryption, etc.

---

## Production Setup (Later)

When ready for production:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Get Live API Keys** (start with `pk_live_` and `sk_live_`)
3. **Create Live Webhook** endpoint in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. **Update Production Environment Variables**
5. **Test with Small Transaction** ($1 or equivalent)

---

## Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe CLI Docs:** https://stripe.com/docs/stripe-cli
- **Test Cards:** https://stripe.com/docs/testing
- **Webhook Testing:** https://stripe.com/docs/webhooks/test
- **API Reference:** https://stripe.com/docs/api

---

**Status:** Follow steps 1-7 to complete Stripe test environment setup.
