# Webhook Configuration Steps

## ✅ Step 1: Cloudflare Tunnel Running

Your public URL: **`https://dui-ultra-cas-welfare.trycloudflare.com`**

Your webhook endpoint will be:
**`https://dui-ultra-cas-welfare.trycloudflare.com/api/webhooks/clerk`**

---

## 📋 Step 2: Configure Webhook in Clerk Dashboard

### Follow These Steps:

1. **Open Clerk Dashboard**
   - Go to: https://dashboard.clerk.com
   - Select your project: **Garrit & Wulf**

2. **Navigate to Webhooks**
   - Click "**Configure**" in the left sidebar
   - Then click "**Webhooks**"

3. **Add New Endpoint**
   - Click "**+ Add Endpoint**" button

4. **Enter Endpoint URL**
   ```
   https://dui-ultra-cas-welfare.trycloudflare.com/api/webhooks/clerk
   ```
   
5. **Subscribe to Events**
   Check these 3 events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`

6. **Add Description** (optional)
   ```
   Local development webhook for user sync
   ```

7. **Click "Create"**

8. **Copy the Signing Secret**
   - After creation, you'll see a "**Signing Secret**"
   - It looks like: `whsec_xxxxxxxxxxxxxxxxxxxxxxxx`
   - **Copy this!** You'll need it in the next step

---

## 🔐 Step 3: Add Signing Secret to Environment

Once you have the signing secret from Clerk, I'll add it to your `.env.local` file.

**Tell me the signing secret** and I'll add it for you!

---

## ✅ Step 4: Restart Dev Server

After adding the secret, we'll restart your Next.js server:

```bash
# I'll run this for you
npm run dev
```

---

## 🧪 Step 5: Test the Webhook

We'll test by:
1. Opening your website in incognito mode
2. Signing up with a test email
3. Checking if the user appears in database automatically
4. Viewing webhook logs in Clerk dashboard

---

## ⚠️ Important Notes

### This URL is temporary!
- URL changes every time you restart cloudflared
- Good for testing only
- For long-term dev, you'd create a named tunnel (optional)

### When you close terminals:
- Webhook will stop working
- Users won't sync automatically
- Use manual scripts: `npm run clerk:sync`

### Next time you start development:
1. Start cloudflared tunnel (get new URL)
2. Update webhook URL in Clerk dashboard
3. Or just use manual sync scripts

---

## 🎯 Current Status

✅ Next.js running on localhost:3000  
✅ Cloudflare tunnel running  
✅ Public URL active: https://dui-ultra-cas-welfare.trycloudflare.com  
⏳ Waiting for you to configure webhook in Clerk dashboard  
⏳ Waiting for signing secret to add to .env.local

---

## 🆘 If You Get Stuck

**Can't find Webhooks in Clerk:**
- Look for "Configure" → "Webhooks" in left sidebar
- Or search for "webhooks" in dashboard

**Webhook creation fails:**
- Check URL is correct
- Make sure it ends with `/api/webhooks/clerk`
- Try again in a few seconds

**Need help:**
- Take a screenshot and show me
- Or describe what you see

---

**Ready?** Go to Clerk Dashboard and follow Step 2! 

Once you get the signing secret (starts with `whsec_`), paste it here and I'll add it to your config.
