# Garrit & Wulf Project - Complete Overview

**Last Updated:** October 6, 2025  
**For:** Developers with limited technical background

---

## 🎯 What Is This Project?

A **car parts website** for Garrit & Wulf company that:
- Shows car parts catalog (European, American, Truck parts)
- Lets customers browse and contact for orders
- Has an **admin panel** to manage products (coming soon)
- Uses modern authentication (Google sign-in, etc.)

**Think of it like:** An online catalog where customers can see parts, and admins can add/edit products from a dashboard.

---

## 🏗️ Technology Stack (What We're Using)

### Frontend (What Users See):
- **Next.js 15** - The main framework (like the foundation of a house)
- **React 19** - Makes the UI interactive (buttons, forms, etc.)
- **Tailwind CSS** - Makes it look beautiful (styling)
- **TypeScript** - Adds safety to code (prevents many bugs)

### Backend (Behind the Scenes):
- **PostgreSQL** - Database (stores all data: users, products, orders)
- **Prisma** - Talks to the database (like a translator)
- **Redis** - Fast temporary storage (for caching)
- **MinIO** - Stores images (product photos)

### Authentication (Login System):
- **Clerk** - Handles all login/signup (Google, email, etc.)
- Saves us from building login ourselves!

### Tools:
- **Docker** - Runs PostgreSQL, Redis, MinIO in containers
- **npm** - Installs packages and runs commands

---

## 📁 Project Structure (Where Everything Lives)

```
garrit-wulf-clone/
│
├── src/                          # All your code lives here
│   ├── app/                      # Pages and routes
│   │   ├── page.tsx              # Homepage
│   │   ├── about/page.tsx        # About page
│   │   ├── contact/page.tsx      # Contact page
│   │   ├── parts/page.tsx        # Parts catalog page
│   │   └── api/                  # Backend API routes
│   │       ├── webhooks/clerk/   # Clerk user sync endpoint
│   │       └── contact/          # Contact form API
│   │
│   ├── components/               # Reusable UI pieces
│   │   ├── Header.tsx            # Top navigation bar
│   │   ├── Footer.tsx            # Bottom footer
│   │   └── sections/             # Homepage sections
│   │
│   └── lib/                      # Utilities and helpers
│       ├── prisma.ts             # Database connection
│       └── minio.ts              # Image storage utilities
│
├── prisma/                       # Database configuration
│   ├── schema.prisma             # Database structure definition
│   └── seed.ts                   # Test data
│
├── scripts/                      # Helper scripts
│   ├── sync-existing-users.ts    # Sync Clerk users to database
│   ├── cleanup-deleted-users.ts  # Clean up deleted users
│   └── setup-minio.ts            # Create storage buckets
│
├── public/                       # Static files (images, logos)
│   └── images/                   # Product images
│
├── docs/                         # Documentation
│   ├── SETUP-COMPLETE.md         # Setup completion guide
│   ├── clerk-webhook-setup.md    # Webhook configuration
│   └── tunneling-alternatives.md # Local development tunnels
│
├── memory-bank/                  # Project knowledge base
│   ├── projectbrief.md           # Project overview
│   ├── progress.md               # What's done/what's left
│   └── systemPatterns.md         # Architecture decisions
│
└── docker-compose.dev.yml        # Backend services config
```

---

## 🔌 How Everything Connects (The Big Picture)

### Visual Diagram:

```
┌─────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                       │
│  (Sees website, clicks buttons, fills forms)               │
└─────────────────────────────────────────────────────────────┘
                           ↓ ↑
                      HTTP Requests
                           ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS APP (localhost:3000)               │
│  - Renders pages (homepage, about, parts)                   │
│  - Handles forms (contact form)                             │
│  - API routes (/api/...)                                    │
└─────────────────────────────────────────────────────────────┘
        ↓                    ↓                    ↓
        ↓                    ↓                    ↓
   ┌────────┐         ┌────────────┐       ┌──────────┐
   │ Clerk  │         │ PostgreSQL │       │  MinIO   │
   │ (Auth) │         │ (Database) │       │ (Images) │
   └────────┘         └────────────┘       └──────────┘
   Cloud ☁️            Docker 🐳            Docker 🐳
   
   Handles:           Stores:              Stores:
   - Sign up          - Users              - Product images
   - Sign in          - Products           - Category images
   - Google login     - Orders             - User uploads
   - Sessions         - Messages
```

---

## 🔄 Data Flow Examples

### Example 1: User Signs Up with Google

```
1. User clicks "Sign in with Google" button
   ↓
2. Clerk handles the Google OAuth flow
   ↓
3. User approves and signs in
   ↓
4. Clerk creates user account (in Clerk's cloud)
   ↓
5. [WEBHOOK] Clerk sends notification to your API
   ↓
6. Your API receives webhook at /api/webhooks/clerk
   ↓
7. API creates user record in PostgreSQL
   ↓
8. User is now in both Clerk AND your database
   ↓
9. User sees their profile button in header
```

**Current Status:** ⚠️ Steps 1-4 work, but 5-8 need tunnel setup!

---

### Example 2: Viewing Products (Future)

```
1. User visits /parts page
   ↓
2. Next.js fetches products from PostgreSQL via Prisma
   ↓
3. For each product, loads images from MinIO
   ↓
4. Displays product cards with images, names, prices
   ↓
5. User can filter by category (European, American, Truck)
```

**Current Status:** 🚧 Not built yet (Phase 3-4)

---

### Example 3: Admin Uploads Product (Future)

```
1. Admin signs in (must have ADMIN role)
   ↓
2. Goes to /admin/parts/new
   ↓
3. Fills form: name, description, price, category
   ↓
4. Uploads 5 images
   ↓
5. Images sent to MinIO (S3 storage)
   ↓
6. MinIO returns URLs for each image
   ↓
7. Product data + image URLs saved to PostgreSQL
   ↓
8. Success! Product now appears on /parts page
```

**Current Status:** 🚧 Not built yet (Phase 3-4)

---

## 🗄️ Database Structure (What Data We Store)

### Users Table
```
┌──────────────────────────────────────────────┐
│ Users (people who sign up)                   │
├──────────────────────────────────────────────┤
│ id          → user_abc123 (from Clerk)       │
│ email       → user@example.com               │
│ name        → John Doe                       │
│ role        → ADMIN or VIEWER                │
│ createdAt   → 2025-10-06                     │
└──────────────────────────────────────────────┘
```

### Categories Table
```
┌──────────────────────────────────────────────┐
│ Categories (European, American, Truck)       │
├──────────────────────────────────────────────┤
│ id          → 1, 2, 3...                     │
│ name        → European Parts                 │
│ description → High-quality European...       │
│ image       → https://minio.../cat1.jpg      │
└──────────────────────────────────────────────┘
```

### Parts Table
```
┌──────────────────────────────────────────────┐
│ Parts (actual car parts)                     │
├──────────────────────────────────────────────┤
│ id          → 1, 2, 3...                     │
│ name        → BMW Brake Pad Set              │
│ description → Premium brake pads for...      │
│ price       → 150.00                         │
│ categoryId  → 1 (links to European)          │
│ images      → [url1, url2, url3, url4, url5] │
│ inStock     → true/false                     │
└──────────────────────────────────────────────┘
```

### Orders, Customers, Messages Tables
- **Orders:** Customer purchases
- **Customers:** Customer information
- **ContactMessages:** Messages from contact form

---

## ⚙️ What's Currently Working

### ✅ Fully Working:
1. **Homepage** - Hero section, statistics, categories
2. **About Page** - Company info, values
3. **Contact Page** - Contact form UI, Google Maps
4. **Authentication** - Clerk login/signup with Google
5. **Database** - PostgreSQL running in Docker
6. **Image Storage** - MinIO configured with buckets
7. **User Profile** - Can see logged-in user in header

### ⚠️ Partially Working:
1. **User Sync** - Works manually via scripts
   - Run `npm run clerk:sync` to sync users
   - Run `npm run clerk:cleanup` to clean deleted users
   - **Needs:** Webhook setup for automatic sync

2. **Parts Page** - Page exists but no products yet
   - **Needs:** Product data and admin panel to add them

### ❌ Not Started Yet:
1. **Admin Panel** - Dashboard to manage products
2. **Product Management** - Add/edit/delete products
3. **Contact Form Backend** - Actually send emails
4. **Search Functionality** - Search for parts
5. **Role-Based Access** - Protect admin routes

---

## 🎯 Current Project Phase

### Phase 1: Foundation (90% Complete) ✅
- [x] Next.js setup
- [x] Database configured
- [x] Authentication integrated
- [x] Image storage setup
- [ ] Webhook configured ← **YOU ARE HERE**

### Phase 2: Admin UI (0% Complete) 🚧
- [ ] Admin layout with sidebar
- [ ] Dashboard page
- [ ] Protected admin routes
- [ ] Role-based access control

### Phase 3: Category Management (0% Complete) 🚧
- [ ] List categories
- [ ] Add new category
- [ ] Edit category
- [ ] Upload category images

### Phase 4: Product Management (0% Complete) 🚧
- [ ] List products
- [ ] Add new product
- [ ] Edit product
- [ ] Upload multiple images per product
- [ ] Rich text editor for descriptions

### Phase 5: Public Features (0% Complete) 🚧
- [ ] Browse products by category
- [ ] Search products
- [ ] Contact form backend
- [ ] Order inquiry system

---

## 🔐 Authentication Flow (How Login Works)

### Components:

1. **Clerk (Cloud Service)**
   - Handles all authentication logic
   - Stores user passwords securely
   - Manages Google OAuth
   - Sends emails for verification

2. **Your Middleware** (`src/middleware.ts`)
   - Checks if user is logged in
   - Protects certain routes
   - Redirects if not authenticated

3. **ClerkProvider** (in layout.tsx)
   - Wraps entire app
   - Makes user data available everywhere

4. **UI Components** (in Header.tsx)
   - `<SignInButton>` - Opens sign-in modal
   - `<SignUpButton>` - Opens sign-up modal
   - `<UserButton>` - Shows user profile dropdown

### What Happens When User Signs In:

```
User clicks "Sign In"
    ↓
Clerk modal opens (not a new page)
    ↓
User chooses Google or Email
    ↓
Clerk handles verification
    ↓
Clerk creates session (JWT token)
    ↓
Token stored in browser cookies
    ↓
User redirected to homepage
    ↓
Middleware checks token on every page
    ↓
If valid: Allow access
If invalid: Redirect to sign-in
```

---

## 🐳 Docker Services (What's Running)

### PostgreSQL (Database)
- **Port:** 5432
- **Username:** garritwulf_user
- **Password:** garritwulf_secure_pass_2025
- **Database:** garritwulf_db
- **What it does:** Stores all your data (users, products, orders)

### Redis (Cache)
- **Port:** 6379
- **What it does:** Fast temporary storage
- **Use case:** Session storage, caching frequently accessed data
- **Status:** Configured but not actively used yet

### MinIO (Image Storage)
- **API Port:** 9000
- **Console Port:** 9001
- **Console URL:** http://localhost:9001
- **Username:** garritwulf_minio
- **Password:** garritwulf_minio_secure_2025
- **What it does:** Stores images (like Amazon S3)
- **Buckets:**
  - `product-images` - Product photos
  - `category-images` - Category thumbnails
  - `user-uploads` - Any user-uploaded files

### Starting/Stopping Services:

```bash
# Start all services
npm run docker:dev

# Stop all services
npm run docker:dev:stop

# View logs
npm run docker:dev:logs

# Check if running
docker ps
```

---

## 📝 Important Configuration Files

### `.env.local` (Environment Variables)
**What it is:** Configuration secrets (passwords, API keys)

**Contains:**
- Clerk API keys (for authentication)
- Database connection URL
- MinIO credentials
- Redis URL

**⚠️ NEVER commit this file to Git!** (Already in `.gitignore`)

---

### `prisma/schema.prisma` (Database Schema)
**What it is:** Definition of database structure

**Defines:**
- What tables exist (Users, Parts, Categories, etc.)
- What columns each table has
- Relationships between tables

**After changing:**
```bash
npm run db:migrate  # Apply changes to database
```

---

### `docker-compose.dev.yml` (Docker Configuration)
**What it is:** Configuration for backend services

**Defines:**
- PostgreSQL settings
- Redis settings
- MinIO settings
- Port mappings
- Volume storage

---

### `src/middleware.ts` (Route Protection)
**What it is:** Security guard for your routes

**Does:**
- Checks if user is logged in
- Protects admin routes
- Allows public routes (homepage, about, etc.)
- Makes webhook endpoint public

---

## 🛠️ Common Commands (npm scripts)

### Development:
```bash
npm run dev              # Start Next.js app (localhost:3000)
npm run docker:dev       # Start backend services (DB, Redis, MinIO)
npm run docker:dev:stop  # Stop backend services
```

### Database:
```bash
npm run db:studio        # Open database GUI (localhost:5555)
npm run db:migrate       # Apply database changes
npm run db:generate      # Regenerate Prisma client
npm run db:reset         # Reset database (deletes all data!)
```

### Clerk User Sync:
```bash
npm run clerk:sync       # Sync users from Clerk to database
npm run clerk:cleanup    # Remove deleted users from database
```

### MinIO:
```bash
npm run setup:minio      # Create storage buckets
```

---

## 🐛 Troubleshooting Common Issues

### "Database connection error"
```bash
# Check if Docker services are running
docker ps

# If not running, start them
npm run docker:dev

# Wait 10 seconds, then try again
```

---

### "Port 3000 already in use"
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or just restart your computer
```

---

### "Clerk authentication not working"
1. Check `.env.local` has correct Clerk keys
2. Restart dev server: `npm run dev`
3. Clear browser cache
4. Try incognito/private mode

---

### "Images not uploading to MinIO"
```bash
# Check MinIO is running
docker ps | grep minio

# Check MinIO console
# Open: http://localhost:9001
# Login with: garritwulf_minio / garritwulf_minio_secure_2025

# Verify buckets exist
npm run setup:minio
```

---

## 🎓 Learning Resources

### Next.js Basics:
- Official Tutorial: https://nextjs.org/learn
- Documentation: https://nextjs.org/docs

### Prisma (Database):
- Getting Started: https://www.prisma.io/docs/getting-started
- Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference

### Clerk (Authentication):
- Quick Start: https://clerk.com/docs/quickstarts/nextjs
- Components: https://clerk.com/docs/components/overview

### Docker:
- Docker 101: https://www.docker.com/101-tutorial/

---

## ❓ FAQ (Frequently Asked Questions)

### Q: Do I need to know all these technologies?
**A:** No! You just need to know:
- Basic JavaScript/TypeScript
- How to run npm commands
- How to edit React components

The setup is already done!

---

### Q: Can I break something?
**A:** Hard to break! Database and services are in Docker containers. If something breaks:
1. Stop everything: `npm run docker:dev:stop`
2. Start fresh: `npm run docker:dev`
3. Reset database: `npm run db:reset`

---

### Q: Where do I start coding?
**A:** Start with:
- `src/app/page.tsx` - Modify homepage
- `src/components/` - Create new UI components
- `src/app/about/page.tsx` - Edit about page

---

### Q: How do I test my changes?
**A:**
1. Save your file
2. Next.js auto-reloads (hot reload)
3. Refresh browser
4. See your changes instantly!

---

### Q: What's the webhook thing about?
**A:** It's for automatic user syncing. Not critical right now. You can:
- Skip it for now and use manual scripts
- Or follow `docs/tunneling-alternatives.md` to set it up

---

## 🚀 Next Steps

### Immediate (This Week):
1. **Set up tunnel** (Cloudflare recommended)
2. **Configure Clerk webhook**
3. **Test automatic user sync**
4. **Start building admin layout**

### Short-term (Next 2 Weeks):
1. Build admin dashboard
2. Add category management
3. Add product management
4. Upload test products

### Long-term (Next Month):
1. Public product browsing
2. Search functionality
3. Contact form backend
4. Deploy to production

---

## 📞 Need Help?

If you're stuck:
1. Check `docs/` folder for guides
2. Check `memory-bank/` for project context
3. Ask specific questions about what's not working

**Current Status:** Phase 1 (90% complete) - Webhook setup remaining

---

**Remember:** You don't need to understand everything! Focus on learning one piece at a time. The foundation is solid, now we just need to build the features on top! 🎉
