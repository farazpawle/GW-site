# Clerk Webhook Setup Guide

## Overview
This webhook syncs users from Clerk to your local PostgreSQL database automatically.

**Webhook Endpoint:** `/api/webhooks/clerk`

---

## Step 1: Get Your Webhook Secret

1. Go to **Clerk Dashboard**: https://dashboard.clerk.com
2. Select your project: **Garrit & Wulf**
3. Navigate to **Webhooks** in the left sidebar
4. Click **+ Add Endpoint**

---

## Step 2: Configure the Webhook

### Endpoint URL
For local development, you need to expose your localhost to the internet. Choose one:

#### Option A: ngrok (Recommended for testing)
```bash
# Install ngrok (if not already installed)
# Download from: https://ngrok.com/download

# Start your Next.js dev server
npm run dev

# In a new terminal, expose port 3000
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Your webhook URL will be: https://abc123.ngrok.io/api/webhooks/clerk
```

#### Option B: localhost.run (Free alternative)
```bash
# Start your Next.js dev server
npm run dev

# In a new terminal
ssh -R 80:localhost:3000 localhost.run

# Copy the HTTPS URL
# Your webhook URL will be: https://your-url.lhr.life/api/webhooks/clerk
```

#### Option C: Production URL (When deployed)
```
https://your-domain.com/api/webhooks/clerk
```

### Events to Subscribe
Select these events:
- ✅ `user.created`
- ✅ `user.updated`
- ✅ `user.deleted`

### Settings
- **Description:** Sync users to PostgreSQL
- **Signing Secret:** Copy this! You'll need it next.

---

## Step 3: Add Webhook Secret to Environment

1. Copy the **Signing Secret** from Clerk dashboard
2. Open `.env.local` in your project
3. Add this line:

```env
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

4. **Restart your dev server** (the secret won't load until restart)

```bash
# Stop the server (Ctrl+C) then restart
npm run dev
```

---

## Step 4: Test the Webhook

### Test User Creation

1. **Open your website** in incognito/private mode
2. **Sign up** with a new email (e.g., test2@example.com)
3. **Check Prisma Studio**:
   ```bash
   npm run db:studio
   ```
4. **Look for the new user** in the `users` table

### Expected Result
- ✅ User appears in Clerk dashboard
- ✅ User appears in Prisma Studio (PostgreSQL)
- ✅ Email, name, and role are synced

### View Webhook Logs
In Clerk dashboard:
1. Go to **Webhooks**
2. Click your endpoint
3. Click **Logs** tab
4. Check for successful deliveries (status 200)

---

## Step 5: Verify Existing Users

If you already signed up before setting up the webhook, those users won't be in your database yet.

### Sync Existing User Manually

1. **Open Prisma Studio**:
   ```bash
   npm run db:studio
   ```

2. **Go to the `users` table**

3. **Click "+ Add Record"**

4. **Fill in the data**:
   - `id`: Copy from Clerk dashboard (User ID, starts with `user_`)
   - `email`: Your email from Clerk
   - `name`: Your name
   - `role`: Select `VIEWER` (or `ADMIN` if you want admin access)
   - `createdAt`: Leave default (now)
   - `updatedAt`: Leave default (now)

5. **Click "Save 1 change"**

### Or Run This Script (Optional)
Create `scripts/sync-existing-users.ts`:

```typescript
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../src/lib/prisma';

async function syncExistingUsers() {
  try {
    console.log('📥 Fetching users from Clerk...');
    
    const client = await clerkClient();
    const users = await client.users.getUserList();

    console.log(`Found ${users.data.length} users in Clerk`);

    for (const user of users.data) {
      const primaryEmail = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      );

      if (!primaryEmail) {
        console.log(`⚠️ Skipping user ${user.id} - no email`);
        continue;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (existingUser) {
        console.log(`ℹ️ User ${user.id} already exists`);
        continue;
      }

      // Create user
      await prisma.user.create({
        data: {
          id: user.id,
          email: primaryEmail.emailAddress,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || user.lastName || null,
          role: 'VIEWER',
        },
      });

      console.log(`✅ Created user: ${primaryEmail.emailAddress}`);
    }

    console.log('✅ Sync complete!');
  } catch (error) {
    console.error('❌ Error syncing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncExistingUsers();
```

Run it:
```bash
npx tsx scripts/sync-existing-users.ts
```

---

## Troubleshooting

### Webhook returns 401 Unauthorized
- ❌ Wrong signing secret
- ✅ Double-check `CLERK_WEBHOOK_SECRET` in `.env.local`
- ✅ Restart dev server after adding the secret

### Webhook returns 500 Internal Server Error
- ❌ Database connection issue
- ✅ Check if Docker containers are running: `docker ps`
- ✅ Check terminal logs for error details

### User not appearing in database
- ❌ Webhook endpoint not public
- ✅ Check middleware.ts includes `/api/webhooks/clerk` in public routes
- ✅ Check webhook logs in Clerk dashboard

### ngrok session expired
- ❌ Free ngrok sessions expire after 2 hours
- ✅ Restart ngrok and update the webhook URL in Clerk dashboard

---

## Production Setup

When deploying to production:

1. **Update Webhook URL** in Clerk dashboard:
   ```
   https://your-domain.com/api/webhooks/clerk
   ```

2. **Keep the same signing secret** (already in production env)

3. **Test with a new sign-up** on production

---

## Next Steps

Once the webhook is working:
- ✅ Users automatically sync to database
- ✅ Ready to implement role-based access control
- ✅ Ready to build admin panel

**Status:** 🔄 Ready to configure in Clerk Dashboard
