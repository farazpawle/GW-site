# Technical Context: Garrit & Wulf Website

## Technology Stack

### Frontend Framework
- **Next.js 15**: React framework with App Router (async params pattern)
- **React 18**: UI library with Server Components
- **TypeScript 5**: Type-safe JavaScript with strict mode

### Authentication & Authorization ✅
- **Clerk**: Authentication provider (Google OAuth, email/password)
- **Webhooks**: User synchronization to local database
- **Middleware**: Route protection with clerkMiddleware
- **Role-Based Access**: ADMIN/VIEWER roles in PostgreSQL

### Database & ORM ✅
- **PostgreSQL**: Relational database (Docker container)
- **Prisma ORM**: Type-safe database client
- **Migrations**: Version-controlled schema changes
- **Seeding**: Initial data setup via seed.ts

### Object Storage ✅
- **MinIO**: S3-compatible object storage (Docker container)
- **AWS SDK**: S3 client for image uploads
- **Multi-Image Upload**: Drag-drop interface with preview

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Lucide React**: Icon library
- **Google Fonts (Oswald)**: Typography

### Form Handling ✅
- **react-hook-form 7.63**: Form state management
- **Zod 4.1**: Schema validation
- **@hookform/resolvers**: Zod integration

### Development Tools
- **ESLint**: Code linting with Next.js config
- **npm**: Package management
- **Git**: Version control

### Infrastructure (Docker) ✅
- **PostgreSQL 15**: Database server
- **Redis 7**: Caching layer
- **MinIO**: Object storage
- **docker-compose**: Multi-container orchestration

### Deployment
- **Docker**: Containerization (docker-compose.yml, Dockerfile)
- **Nginx**: Reverse proxy (nginx.conf)
- **Production**: docker-compose.prod.yml

## Key Dependencies

```json
{
  "dependencies": {
    "next": "15.1.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0",
    "tailwindcss": "^3.4.17",
    "@clerk/nextjs": "^6.9.3",
    "@prisma/client": "^6.1.0",
    "react-hook-form": "^7.63.0",
    "@hookform/resolvers": "^5.2.2",
    "zod": "^4.1.11",
    "@aws-sdk/client-s3": "^3.901.0",
    "svix": "^1.45.0"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "eslint": "^9.17.0",
    "@types/react": "^19.0.6",
    "@types/node": "^22.10.2",
    "prisma": "^6.1.0",
    "tsx": "^4.19.2"
  }
}
```

## Configuration Files

### next.config.ts
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Configure for external images if needed
    ],
  },
};

export default nextConfig;
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Maroon brand color: #6e0000
        // Dark backgrounds: #0a0a0a, #1a1a1a
        // Borders: #2a2a2a
        // Light maroon: #ff9999
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

### tsconfig.json
- Strict mode enabled
- Path aliases: `@/*` points to `./src/*`
- Target: ES2017+
- Module: ESNext

## Build & Development

### Development Commands
```bash
npm run dev          # Start development server (localhost:3001)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database Commands
npx prisma migrate dev      # Create and apply migrations
npx prisma db push          # Push schema changes to database
npx prisma db seed          # Seed database with initial data
npx prisma studio           # Open Prisma Studio (database GUI)

# User Sync Commands
npm run clerk:sync          # Sync existing Clerk users to database
npm run clerk:cleanup       # Remove orphaned users from database
```

### Docker Commands
```bash
docker-compose up -d                 # Start all services (PostgreSQL, Redis, MinIO)
docker-compose down                  # Stop all services
docker-compose logs -f               # View logs
docker-compose ps                    # List running containers
docker-compose -f docker-compose.prod.yml up  # Production
```

## Environment Setup

### Required Environment Variables
```env
# Add to .env.local

# Database
DATABASE_URL="postgresql://garritwulf:garritwulf123@localhost:5432/garritwulf?schema=public"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Object Storage (MinIO)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=garritwulf-uploads
MINIO_USE_SSL=false

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=https://garritwulf.com
```

### Development Environment
- **Node.js**: v18+ recommended
- **npm/yarn**: Latest stable
- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Tailwind CSS IntelliSense
  - Prettier

## Browser Support

### Target Browsers
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari (iOS): Last 2 versions
- Chrome Mobile (Android): Last 2 versions

### Polyfills
- Next.js includes necessary polyfills by default
- No additional polyfills required for target browsers

## Technical Constraints

### Image Requirements
- **Formats**: AVIF, JPG, PNG, WebP supported
- **Location**: Store in `/public/images/`
- **Naming**: Use descriptive names (brake.jpg, engine.jpg)
- **Optimization**: Always use Next/Image component
- **Sizes**: Provide appropriate dimensions to prevent layout shift

### Performance Budgets
- JavaScript bundle: <200KB (main)
- Images: Optimized via Next/Image
- First Load JS: <300KB
- CSS: Tailwind CSS tree-shaking keeps CSS minimal

### SEO Requirements
- **Meta Tags**: Title, description, OG tags in layout/page metadata
- **Semantic HTML**: Proper heading hierarchy (h1 → h6)
- **Alt Text**: All images must have descriptive alt attributes
- **Sitemap**: Generate sitemap.xml
- **Robots.txt**: Configure for proper crawling

## Database & Data (Active) ✅
- **Prisma ORM**: Type-safe database client with schema.prisma
- **PostgreSQL 15**: Running in Docker on port 5432
- **Migrations**: Version-controlled schema changes in prisma/migrations/
- **Seed Data**: prisma/seed.ts for initial data
- **Connection**: Via DATABASE_URL environment variable

### Database Schema
```prisma
model User {
  id         String   @id @default(cuid())
  clerkId    String   @unique
  email      String   @unique
  firstName  String?
  lastName   String?
  role       UserRole @default(VIEWER)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  image       String?
  parts       Part[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Part {
  id               String   @id @default(cuid())
  name             String
  partNumber       String   @unique
  description      String?
  categoryId       String
  category         Category @relation(fields: [categoryId], references: [id])
  price            Float
  costPrice        Float?
  stockQuantity    Int      @default(0)
  images           String[]
  specifications   Json?
  compatibleWith   String[]
  weight           Float?
  dimensions       String?
  warranty         String?
  manufacturer     String?
  oemNumber        String?
  featured         Boolean  @default(false)
  active           Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

## API Endpoints

### Current API Routes
```
# Public Routes
POST /api/contact                           # Submit contact form

# Webhook Routes
POST /api/webhooks/clerk                    # Clerk user sync webhook ✅

# Admin Routes (Protected)
POST   /api/admin/upload                    # Multi-image upload to MinIO ✅
GET    /api/admin/parts                     # List products with filters ✅
POST   /api/admin/parts                     # Create new product ✅
GET    /api/admin/parts/[id]                # Get single product ✅
PUT    /api/admin/parts/[id]                # Update product ✅
DELETE /api/admin/parts/[id]                # Delete product ✅
POST   /api/admin/parts/bulk                # Bulk operations (delete, stock, featured) ✅

GET    /api/admin/categories                # List categories with product count ✅
POST   /api/admin/categories                # Create new category ✅
GET    /api/admin/categories/[id]           # Get single category ✅
PUT    /api/admin/categories/[id]           # Update category ✅
DELETE /api/admin/categories/[id]           # Delete category (with safety check) ✅

# Media Library (Phase 14) ✅
GET    /api/admin/media/buckets             # List all buckets with stats ✅
GET    /api/admin/media/files               # List files in bucket (with pagination & search) ✅
DELETE /api/admin/media/files/[key]         # Delete file from bucket ✅
```

### API Response Format
```typescript
// Success (GET)
{ success: true, data: any }

// Success (POST/PUT/DELETE)
{ success: true, message: string, data?: any }

// Error
{ success: false, error: string }

// Validation Error
{ success: false, error: string, details?: ZodError }
```

## Styling Standards

### Color Palette
```css
/* Brand Colors */
--maroon: #6e0000;
--maroon-light: #ff9999;

/* Backgrounds */
--bg-primary: #0a0a0a;
--bg-secondary: #1a1a1a;

/* Borders */
--border-color: #2a2a2a;

/* Text */
--text-primary: #ffffff;
--text-secondary: #9ca3af; /* gray-400 */
```

### Typography Scale
- **Hero Headings**: text-5xl to text-7xl
- **Section Headings**: text-3xl to text-4xl
- **Card Titles**: text-xl to text-2xl
- **Body Text**: text-base to text-lg
- **Small Text**: text-sm

### Spacing Scale
- **Container**: max-w-7xl with px-4/px-6
- **Section Padding**: py-16 to py-24
- **Card Padding**: p-6 to p-8
- **Grid Gaps**: gap-6 to gap-12

## Deployment Architecture

### Docker Setup
```yaml
# docker-compose.yml - Development
services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development

# docker-compose.prod.yml - Production
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
  web:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
```

### Nginx Configuration
- Reverse proxy to Next.js server
- Static file caching
- Gzip compression
- SSL termination (production)

## Security Considerations
- **Environment Variables**: Never commit .env files
- **Form Validation**: Validate all inputs server-side
- **CORS**: Configure for production domain only
- **CSP**: Content Security Policy headers via next.config.ts
- **Rate Limiting**: Consider for contact form submissions
