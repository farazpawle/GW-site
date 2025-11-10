# Automatic Initialization System

## Overview

The website now has **automatic initialization** that eliminates the need to run separate setup scripts manually. When you start the application, it automatically:

1. ✅ **Checks and creates MinIO bucket** if missing
2. ✅ **Seeds essential database records** (pages, menu items, homepage sections) if missing
3. ✅ **Works idempotently** - safe to run multiple times, won't duplicate data

## What Changed

### Before ❌

```bash
# Manual setup required every time:
npm run docker:dev
npm run db:migrate
npm run db:seed
npx tsx scripts/seed-default-pages.ts
npx tsx scripts/seed-default-menu-items.ts
npx tsx scripts/seed-homepage-sections.ts
npm run setup:minio
```

### After ✅

```bash
# Just start the app:
npm run docker:dev  # Start Docker services
npm run db:migrate  # Run migrations (still manual - safer)
npm run dev         # Start app - everything else auto-initializes!
```

## How It Works

### Architecture

```
App Startup (layout.tsx)
    ↓
initializeApplication()
    ├─→ ensureMinioBucket()
    │   ├─ Check if bucket exists
    │   └─ Create if missing
    │
    └─→ ensureEssentialData()
        ├─ Ensure pages exist (Home, Products, About, Contact)
        ├─ Ensure menu items exist
        └─ Ensure homepage sections exist
```

### Code Structure

```
src/lib/initialization/
├── index.ts                    # Main orchestrator
├── ensure-minio.ts             # MinIO bucket auto-creation
└── ensure-essential-data.ts    # Database seeding logic
```

### When Initialization Runs

- **On app startup**: Every time you run `npm run dev` or `npm start`
- **First run only (effectively)**: Uses idempotent checks - won't duplicate data
- **Non-blocking**: Won't crash app if initialization fails (just logs errors)

## What Gets Auto-Created

### 1. MinIO Bucket

- **Bucket**: `garritwulf-media`
- **Policy**: Public read access for images
- **Folders**: `products/`, `categories/`, `general/`, `icons/`

### 2. Essential Pages

- **Home** (`/home`) - Homepage with sections
- **Products** (`/products`) - Product catalog
- **About Us** (`/about`) - About page
- **Contact Us** (`/contact`) - Contact page

### 3. Navigation Menu

- HOME → `/home`
- PRODUCTS → `/products`
- ABOUT US → `/about`
- CONTACT US → `/contact`

### 4. Homepage Sections

- **Hero Section** - Main banner with statistics
- **Brand Story** - Company story and features
- **Carousel** - Partner logos
- **Categories** - European/American/Truck parts
- **Precision Manufacturing** - Service showcase

## Manual Seeding (Still Works!)

You can still manually seed the database if needed:

```bash
npm run db:seed
```

The `prisma/seed.ts` file has been updated to include:

- ✅ Site settings
- ✅ Categories
- ✅ Sample products
- ✅ **NEW: Essential pages**
- ✅ **NEW: Menu items**
- ✅ **NEW: Homepage sections**
- ✅ Collections

## Production Deployment

The initialization system works seamlessly in production:

```bash
# On VPS after git pull:
docker build -t app_nextjs-app:latest .
docker stop GW-nextjs
docker rm GW-nextjs
docker run -d --name GW-nextjs ... app_nextjs-app:latest

# That's it! App auto-initializes on first request
```

## Environment Variables

No additional configuration needed! The system uses existing env variables:

- `MINIO_ENDPOINT` - MinIO server address
- `MINIO_PORT` - MinIO port
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `MINIO_BUCKET_NAME` - Bucket name (default: `garritwulf-media`)
- `DATABASE_URL` - PostgreSQL connection string

## Logs & Monitoring

### Successful Initialization

```
🚀 Starting application initialization...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 STEP 1: MinIO Bucket Setup
────────────────────────────────────────

🔍 Checking MinIO bucket...
✅ MinIO bucket "garritwulf-media" already exists

────────────────────────────────────────

🌱 STEP 2: Essential Data Setup
────────────────────────────────────────

🔍 Checking essential pages...
  ⏭️  Page already exists: Home
  ⏭️  Page already exists: Products
  ⏭️  Page already exists: About Us
  ⏭️  Page already exists: Contact Us

🔍 Checking navigation menu...
  ⏭️  Menu items already exist (4 items)

🔍 Checking homepage sections...
  ⏭️  Homepage sections already exist (5 sections)

✅ Essential data check complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Application initialization complete!
```

### First-Time Run

```
🔍 Checking MinIO bucket...
📦 Creating MinIO bucket: garritwulf-media
✅ Created MinIO bucket: garritwulf-media
✅ Set public read policy for: garritwulf-media

🔍 Checking essential pages...
  ✅ Created page: Home (/home)
  ✅ Created page: Products (/products)
  ✅ Created page: About Us (/about)
  ✅ Created page: Contact Us (/contact)

🔍 Checking navigation menu...
  ✅ Created 4 menu items

🔍 Checking homepage sections...
  📦 Creating 5 homepage sections...
  ✅ Created 5 homepage sections
```

## Troubleshooting

### Issue: "MinIO initialization failed"

**Cause**: MinIO service not running or not accessible

**Solution**:

```bash
# Check if MinIO container is running
docker ps | grep minio

# Start Docker services
npm run docker:dev

# Check MinIO logs
docker logs GW-minio
```

### Issue: "Database initialization failed"

**Cause**: Database schema not applied or connection issues

**Solution**:

```bash
# Run migrations first
npm run db:migrate

# Check database connection
docker ps | grep postgres

# Check Prisma connection
npx prisma db pull
```

### Issue: "Initialization runs every time"

**Cause**: This is expected behavior! But checks are idempotent

**Effect**: Minimal performance impact (~100-200ms)

**If needed**: The system caches successful initialization in memory during app lifecycle

## Technical Details

### Idempotency

All initialization functions are **idempotent**:

- **MinIO**: Uses `HeadBucketCommand` to check existence
- **Pages**: Uses `findUnique` before creating
- **Menu Items**: Checks `count()` before creating
- **Sections**: Queries existing sections before creating

### Error Handling

- **Non-blocking**: Initialization failures won't prevent app from starting
- **Graceful degradation**: Logs errors but continues
- **Detailed logging**: Easy to diagnose issues

### Performance

- **First run**: ~2-3 seconds (creates all resources)
- **Subsequent runs**: ~100-200ms (quick checks only)
- **No database locks**: Uses safe upsert operations

## Migration from Old System

If you have existing installations:

### No Action Needed! 🎉

The initialization system:

- ✅ Detects existing data and skips creation
- ✅ Works alongside existing manual scripts
- ✅ Won't duplicate or overwrite anything

### Optional: Clean Up

You can optionally remove old scripts from `scripts/`:

- `seed-default-pages.ts` _(functionality now in core)_
- `seed-default-menu-items.ts` _(functionality now in core)_
- `seed-homepage-sections.ts` _(functionality now in core)_
- `setup-navigation.ts` _(functionality now in core)_

**Keep these**:

- `setup/setup-minio.ts` _(still useful for manual setup)_
- `seed-*.ts` _(other seeding scripts for development)_

## Summary

✅ **Zero manual setup** for essential features  
✅ **Idempotent** - safe to run multiple times  
✅ **Non-blocking** - won't crash app  
✅ **Production-ready** - works in all environments  
✅ **Developer-friendly** - clear logs and error messages

**Before**: 7+ manual commands  
**After**: Just run `npm run dev` 🚀
