# Local Tunneling Solutions for Webhook Development

## Why Do We Need This?

**Problem:** Clerk (cloud service) needs to send webhooks to your computer, but your computer is on `localhost` (private network).

**Solution:** Create a "tunnel" - a public URL that forwards requests to your localhost.

---

## Option 1: Cloudflare Tunnel (FREE - Recommended)

### Installation:
```bash
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
# Or use winget:
winget install --id Cloudflare.cloudflared
```

### Usage:
```bash
# Start tunnel
cloudflared tunnel --url http://localhost:3000

# Copy the HTTPS URL it gives you
# Example: https://abc-123-xyz.trycloudflare.com
```

### Pros:
✅ Completely free
✅ No account required
✅ No time limits
✅ Fast and reliable
✅ Made by Cloudflare (trusted)

### Cons:
❌ URL changes every restart
❌ Requires command-line usage

---

## Option 2: localhost.run (FREE)

### Usage:
```bash
# Using SSH (no installation needed)
ssh -R 80:localhost:3000 localhost.run

# Copy the HTTPS URL it gives you
# Example: https://abc123.lhr.life
```

### Pros:
✅ Completely free
✅ No installation needed
✅ Works via SSH
✅ Simple to use

### Cons:
❌ Requires SSH client (built-in on Windows 10+)
❌ URL changes every restart
❌ Sometimes slow

---

## Option 3: Tunnelmole (FREE)

### Installation:
```bash
npm install -g tunnelmole
```

### Usage:
```bash
# Start tunnel
tmole 3000

# Copy the HTTPS URL
# Example: https://abc123.tunnelmole.net
```

### Pros:
✅ Free
✅ Easy npm install
✅ Simple CLI
✅ Open source

### Cons:
❌ Less known/tested
❌ URL changes every restart

---

## Option 4: Serveo (FREE)

### Usage:
```bash
# Using SSH
ssh -R 80:localhost:3000 serveo.net

# Copy the URL it gives you
```

### Pros:
✅ Free
✅ No installation
✅ Works via SSH

### Cons:
❌ Sometimes unstable
❌ URL changes every restart

---

## Option 5: VS Code Port Forwarding (FREE - If you use VS Code)

### Usage:
1. Open VS Code
2. Go to "Ports" tab (bottom panel)
3. Click "Forward a Port"
4. Enter `3000`
5. Right-click port → "Port Visibility" → "Public"
6. Right-click port → "Copy Forwarded Address"

### Pros:
✅ Built into VS Code
✅ Free
✅ No extra tools needed
✅ Easy to use

### Cons:
❌ Requires GitHub account
❌ Requires VS Code remote tunnels enabled

---

## Option 6: ngrok (FREE tier limited)

### Installation:
1. Download: https://ngrok.com/download
2. Extract exe file
3. Run from command line

### Usage:
```bash
ngrok http 3000

# Copy the HTTPS URL
# Example: https://abc123.ngrok-free.app
```

### Pros:
✅ Most popular/tested
✅ Good documentation
✅ Web interface for debugging

### Cons:
❌ Requires account signup
❌ Free tier: 1 session at a time, 2-hour limit
❌ Banner page on free tier

---

## My Recommendation: Cloudflare Tunnel

**Why?**
- ✅ Free forever
- ✅ No account needed
- ✅ No time limits
- ✅ Made by a major company (Cloudflare)
- ✅ Fast and reliable

**Setup Steps:**

1. **Install:**
   ```bash
   winget install --id Cloudflare.cloudflared
   ```

2. **Start your Next.js app:**
   ```bash
   npm run dev
   ```

3. **In a NEW terminal, start tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

4. **Copy the HTTPS URL** (something like `https://abc-xyz.trycloudflare.com`)

5. **Use that URL in Clerk webhook:**
   ```
   https://your-cloudflare-url.trycloudflare.com/api/webhooks/clerk
   ```

---

## Quick Comparison

| Tool | Free? | Time Limit | Account? | Installation | Speed |
|------|-------|------------|----------|--------------|-------|
| **Cloudflare** | ✅ Yes | ❌ None | ❌ No | Small exe | ⚡ Fast |
| localhost.run | ✅ Yes | ❌ None | ❌ No | None (SSH) | 🐢 Medium |
| Tunnelmole | ✅ Yes | ❌ None | ❌ No | npm | ⚡ Fast |
| VS Code | ✅ Yes | ❌ None | ✅ GitHub | None | ⚡ Fast |
| ngrok | ⚠️ Limited | ✅ 2 hours | ✅ Yes | Small exe | ⚡ Fast |
| Serveo | ✅ Yes | ❌ None | ❌ No | None (SSH) | 🐢 Slow |

---

## For Production

**Important:** These tunnels are **only for development/testing**!

When you deploy to a real server (Vercel, Netlify, etc.), you'll have a real public URL, and you won't need tunnels anymore.

**Production webhook URL will be:**
```
https://your-actual-domain.com/api/webhooks/clerk
```

---

## What Are We Using This For?

### Current Workflow (Without Tunnel):
```
User signs up → Clerk saves user → Your database is NOT updated
```

### After Setting Up Tunnel:
```
User signs up → Clerk saves user → Clerk sends webhook through tunnel → Your API receives it → Database updated automatically
```

**It's temporary!** Only needed for local development. Once deployed, the tunnel is not needed.

---

## Need Help?

If you have issues with any of these tools, let me know and I'll help troubleshoot!

**Recommended: Try Cloudflare Tunnel first** - it's the easiest and most reliable.
