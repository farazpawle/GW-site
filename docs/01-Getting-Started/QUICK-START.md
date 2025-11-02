# Quick Start Guide - For Beginners

## Daily Workflow (What You Do Every Day)

### 1. Start Backend Services (Once per day)
```bash
npm run docker:dev
```
**What this does:** Starts PostgreSQL, Redis, MinIO in background  
**When:** First thing when you start working  
**Wait:** 10 seconds before next step

---

### 2. Start Next.js Development Server
```bash
npm run dev
```
**What this does:** Starts your website  
**Open:** http://localhost:3000  
**Leave running:** Keep this terminal open while coding

---

### 3. Code & Test
- Edit files in `src/` folder
- Save file → Browser auto-refreshes
- See changes instantly!

---

### 4. When Done for the Day
```bash
# Stop Next.js (in dev terminal)
Ctrl+C

# Stop Docker services
npm run docker:dev:stop
```

---

## Useful Commands

### View Database (Like Excel for your data)
```bash
npm run db:studio
```
Opens at: http://localhost:5555

---

### View MinIO (Image storage)
Open browser: http://localhost:9001  
Login:
- Username: `garritwulf_minio`
- Password: `garritwulf_minio_secure_2025`

---

### Sync Users from Clerk
```bash
npm run clerk:sync
```
**When:** After someone signs up and you don't see them in database

---

### Clean Deleted Users
```bash
npm run clerk:cleanup
```
**When:** After deleting users from Clerk dashboard

---

## File Structure (Where to Edit)

```
src/
├── app/
│   ├── page.tsx          ← Edit homepage here
│   ├── about/page.tsx    ← Edit about page
│   └── contact/page.tsx  ← Edit contact page
│
└── components/
    ├── Header.tsx        ← Top navigation bar
    ├── Footer.tsx        ← Bottom footer
    └── sections/         ← Homepage sections
```

---

## What You Need to Know

### To Edit Pages:
1. Find the page file (e.g., `src/app/about/page.tsx`)
2. Edit the text inside `<h1>`, `<p>`, etc.
3. Save file
4. Browser auto-refreshes
5. Done!

### To Add Images:
1. Put image in `public/images/` folder
2. Use in code:
   ```tsx
   <img src="/images/your-image.jpg" alt="Description" />
   ```

### To Change Styles:
- Edit Tailwind classes in the JSX
- Example: `className="text-red-500"` makes text red
- Tailwind docs: https://tailwindcss.com/docs

---

## Common Problems & Solutions

### Problem: "Port 3000 already in use"
**Solution:** Something else is using port 3000
```bash
# Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <number_you_see> /F

# Then try npm run dev again
```

---

### Problem: "Database connection failed"
**Solution:** Docker services not running
```bash
# Start Docker services
npm run docker:dev

# Wait 10 seconds
# Try again
```

---

### Problem: "Cannot find module ..."
**Solution:** Dependencies not installed
```bash
npm install
```

---

### Problem: Changes not showing
**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache
3. Or try incognito/private mode

---

## Important Files (DON'T DELETE!)

- `.env.local` - Contains secrets (passwords, API keys)
- `prisma/schema.prisma` - Database structure
- `docker-compose.dev.yml` - Docker configuration
- `package.json` - Project dependencies
- `node_modules/` - Installed packages (can reinstall if deleted)

---

## Folder Meanings

- `src/` - Your code
- `public/` - Images, logos, static files
- `docs/` - Documentation (guides like this)
- `scripts/` - Helper scripts
- `prisma/` - Database stuff
- `node_modules/` - Downloaded packages (don't edit)
- `.next/` - Build files (auto-generated, don't edit)

---

## Current Project Status

### ✅ What's Working:
- Homepage, About, Contact pages
- Google sign-in
- Database with tables
- Image storage (MinIO)

### 🚧 What's Not Done Yet:
- Admin panel (to manage products)
- Product listing page
- Automatic user sync (needs webhook)

### 📍 You Are Here:
Phase 1: Foundation (90% complete)

---

## Next Steps

1. **Optional:** Set up webhook for automatic user sync
   - See: `docs/tunneling-alternatives.md`
   - Or skip for now and use manual scripts

2. **Coming Next:** Build admin panel
   - Dashboard page
   - Product management
   - Image uploads

---

## Need More Help?

📖 **Detailed Guide:** `docs/PROJECT-OVERVIEW.md`  
🔧 **Tunnel Setup:** `docs/tunneling-alternatives.md`  
🎯 **Project Progress:** `memory-bank/progress.md`

---

**Remember:** Save often, commit to Git regularly, and don't be afraid to experiment! You can always reset with `git checkout .` 😊
