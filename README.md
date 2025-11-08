# Garrit & Wulf Auto Parts Website

A modern, full-stack e-commerce and showcase platform for **Garrit & Wulf**, a premium auto parts supplier based in Dubai, UAE. Built with Next.js 14, TypeScript, and Prisma, featuring a comprehensive admin panel, role-based access control (RBAC), and dual-mode operation (showcase/e-commerce).

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.16-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## 🌟 Features

### 🛍️ Dual-Mode Platform
- **Showcase Mode**: Product catalog with inquiry forms and contact requests
- **E-commerce Mode**: Full shopping cart, checkout, and payment processing
- Seamless switching between modes via admin settings

### 🎨 Modern Frontend
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Theme**: Professional dark design with maroon (#6e0000) brand accent
- **Dynamic Sections**: Configurable homepage sections (Hero, Categories, Brand Story, Carousel)
- **Product Filtering**: Advanced search with filters (category, brand, origin, tags, price)
- **Image Optimization**: Next.js Image component with WebP support
- **SEO Optimized**: Meta tags, structured data, and sitemap generation

### 🔐 Admin Panel
- **Complete CMS**: Manage products, categories, pages, and media
- **Role-Based Access Control (RBAC)**: 
  - Super Admin, Admin, Manager, Viewer roles
  - Granular permissions (products, categories, pages, users, settings, analytics, media, messages, seo)
- **Product Management**: 
  - Bulk operations (CSV import/export)
  - Image uploads with S3/MinIO integration
  - SKU and part number tracking
  - Featured products and showcase ordering
- **Analytics Dashboard**:
  - Product performance metrics
  - Search analytics
  - User engagement tracking
  - Web Vitals monitoring
- **Message Center**: Contact form submissions with status tracking
- **SEO Tools**: Meta tags, Open Graph, structured data management
- **Media Library**: Centralized file management with upload, organize, and delete

### 🔒 Security & Authentication
- **Clerk Integration**: Secure authentication with social logins
- **RBAC System**: Fine-grained permission control at route and API level
- **API Protection**: Middleware guards for all admin routes
- **Input Validation**: Zod schemas for all forms and API endpoints
- **XSS Protection**: DOMPurify HTML sanitization for CMS content
- **Rate Limiting**: API endpoint protection against abuse (in-memory)
- **CORS Security**: Environment-based origin restrictions
- **CSP Headers**: Content Security Policy for additional XSS protection
- **Security Score**: 8.8/10 (see `docs/SECURITY-AUDIT-REPORT.md`)
- **Error Handling**: Comprehensive error tracking and logging

### 🗄️ Database & Storage
- **PostgreSQL**: Primary database with Prisma ORM
- **MinIO/S3**: Object storage for images and files
- **Docker Support**: Containerized development environment
- **Database Migrations**: Version-controlled schema changes
- **Seeding Scripts**: Sample data for development and testing

### 📊 Analytics & Performance
- **Search Analytics**: Track search queries, results, and conversions
- **Product Analytics**: Views, engagement, and needs attention alerts
- **Web Vitals**: Core Web Vitals tracking (LCP, FID, CLS)
- **A/B Testing**: Built-in framework for feature experiments

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI, Shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context API
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20+
- **Database**: PostgreSQL 16
- **ORM**: Prisma 6.16
- **Authentication**: Clerk
- **File Storage**: MinIO (S3-compatible)
- **API**: Next.js API Routes (REST)

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (recommended)
- **Linting**: ESLint + TypeScript ESLint
- **Testing**: Jest + React Testing Library
- **Git Hooks**: Husky + lint-staged

## 📋 Prerequisites

- **Node.js**: 20.x or higher
- **npm/yarn/pnpm**: Latest stable version
- **Docker**: 24.x or higher (for local development)
- **PostgreSQL**: 16.x (if not using Docker)
- **Clerk Account**: For authentication setup

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/farazpawle/GW-site.git
cd GW-site
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/garritwulf"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# MinIO/S3 Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=garritwulf-media

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 4. Start Docker Services (Recommended)
```bash
# Start PostgreSQL and MinIO containers
npm run docker:dev

# Wait for services to be ready (10 seconds)
# Then run database migrations
npm run db:generate
npm run db:migrate

# Setup MinIO bucket
npm run setup:minio

# Seed initial data (optional)
npm run db:seed
```

### 5. Setup Super Admin
```bash
# Create your first super admin user
npm run setup:super-admin
# Follow the prompts to enter your Clerk user ID
```

### 6. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
garrit-wulf-clone/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Database migrations
├── public/
│   └── images/                # Static images
├── scripts/
│   ├── setup-super-admin.ts   # Admin setup script
│   ├── setup-minio.ts         # Storage setup
│   └── seed-*.ts              # Various seeding scripts
├── src/
│   ├── app/
│   │   ├── (public)/          # Public-facing pages
│   │   ├── admin/             # Admin panel pages
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── admin/             # Admin components
│   │   ├── sections/          # Homepage sections
│   │   ├── ui/                # Reusable UI components
│   │   └── analytics/         # Analytics components
│   ├── lib/
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── prisma.ts          # Prisma client
│   │   ├── rbac/              # RBAC system
│   │   ├── settings.ts        # Site settings
│   │   └── utils/             # Helper functions
│   ├── types/                 # TypeScript type definitions
│   └── middleware.ts          # Next.js middleware (auth)
├── docs/                      # Project documentation
├── memory-bank/               # Project context for AI assistants
├── docker-compose.yml         # Production Docker setup
├── docker-compose.dev.yml     # Development Docker setup
└── README.md                  # This file
```

## 🎯 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Database
```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database
```

### Docker
```bash
npm run docker:dev       # Start dev containers
npm run docker:dev:stop  # Stop dev containers
npm run docker:dev:logs  # View container logs
npm run docker:dev:restart # Restart containers
```

### Setup & Utilities
```bash
npm run setup:all        # Complete setup (Docker + DB + MinIO)
npm run setup:super-admin # Create super admin user
npm run setup:minio      # Initialize MinIO storage
npm run mark:featured    # Mark products as featured
npm run seed:analytics   # Seed analytics data
npm run seed:search      # Seed search analytics
```

## 🔧 Configuration

### Site Settings
Configure site behavior via the admin panel at `/admin/settings`:
- **E-commerce Mode**: Toggle between showcase and e-commerce
- **Product Card Display**: Show/hide prices, compare prices, stock status
- **Favicon**: Upload custom favicons
- **SEO**: Default meta tags and Open Graph settings

### RBAC Permissions
Manage user roles and permissions at `/admin/users`:
- **Roles**: Super Admin, Admin, Manager, Viewer
- **Permissions**: products, categories, pages, users, settings, analytics, media, messages, seo
- **Custom Permissions**: Assign specific permissions to individual users

### Homepage Sections
Customize homepage layout at `/admin/sections`:
- Hero Section
- Categories Grid
- Brand Story
- Brand Carousel
- Precision Manufacturing
- Reorder sections with drag-and-drop

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Tests are located in `__tests__/` directory:
- Component tests: `__tests__/components/`
- Integration tests: `__tests__/integration/`

## 🚢 Deployment

### Docker Production
```bash
# Build and start production containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- Database URL (use managed PostgreSQL)
- Clerk credentials
- MinIO/S3 credentials (use AWS S3 or managed MinIO)
- Public app URL

## 📝 API Documentation

### Public API
- `GET /api/public/showcase/products` - List products
- `GET /api/public/showcase/products/[slug]` - Product details
- `POST /api/contact` - Submit contact form
- `POST /api/quote-requests` - Submit quote request

### Admin API
- `GET /api/admin/parts` - List products (admin)
- `POST /api/admin/parts` - Create product
- `PATCH /api/admin/parts/[id]` - Update product
- `DELETE /api/admin/parts/[id]` - Delete product
- `GET /api/admin/users` - List users
- `GET /api/admin/analytics/*` - Analytics endpoints

All admin API routes require authentication and appropriate permissions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- Use TypeScript for all new code
- Follow ESLint rules (zero errors/warnings)
- Write tests for new features
- Update documentation as needed
- Use conventional commits

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 📧 Contact

**Garrit & Wulf**
- Website: [garritwulf.com](https://garritwulf.com)
- Email: sales@garritwulf.com
- Phone: +971 4 224 38 51
- Location: 26 6A Street, Al Quoz Industrial Area 3, Dubai, UAE

**Developer**
- GitHub: [@farazpawle](https://github.com/farazpawle)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Clerk](https://clerk.com/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - Headless UI components
- [MinIO](https://min.io/) - Object storage