# Prisma Complete Guide

**Last Updated:** October 6, 2025  
**For:** Beginners with limited technical background  
**Project:** Garrit & Wulf Car Parts Website

---

## Table of Contents

1. [Chapter 1: What is Prisma?](#chapter-1-what-is-prisma)
2. [Chapter 2: Prisma's Role in Your Project](#chapter-2-prismas-role-in-your-project)
3. [Chapter 3: How Prisma Works](#chapter-3-how-prisma-works)
4. [Chapter 4: Prisma Schema File](#chapter-4-prisma-schema-file)
5. [Chapter 5: Prisma Commands](#chapter-5-prisma-commands)
6. [Chapter 6: The Correct Workflow](#chapter-6-the-correct-workflow)
7. [Chapter 7: Common Mistakes to Avoid](#chapter-7-common-mistakes-to-avoid)
8. [Chapter 8: Real Examples from Your Project](#chapter-8-real-examples-from-your-project)
9. [Chapter 9: Prisma Tools](#chapter-9-prisma-tools)
10. [Chapter 10: Quick Reference](#chapter-10-quick-reference)

---

## Chapter 1: What is Prisma?

### Simple Definition
Prisma is a **database assistant** that helps your code talk to PostgreSQL database.

### Real-World Analogy
Think of your project like a restaurant:
- **PostgreSQL** = The kitchen warehouse (stores all ingredients)
- **Prisma** = The warehouse manager (organizes, finds, updates items)
- **Your Code** = The chef (requests ingredients easily)

Without Prisma, the chef would need to go into the warehouse, search manually, and organize everything themselves. With Prisma, they just ask the manager "Give me tomatoes" and the manager handles it.

---

### What Prisma Does

| Task | Without Prisma | With Prisma |
|------|----------------|-------------|
| **Speaking to Database** | Write raw SQL (hard) | Write JavaScript/TypeScript (easy) |
| **Safety** | Runtime errors (breaks production) | Compile-time errors (caught early) |
| **Relationships** | Manual JOINs (complex) | Automatic includes (simple) |
| **Database Changes** | Write SQL manually | Auto-generate migrations |
| **Type Safety** | None (easy mistakes) | Full TypeScript support |

---

## Chapter 2: Prisma's Role in Your Project

### 5 Main Jobs

#### 1. 🔄 **Translator (JavaScript ↔ SQL)**

Converts your JavaScript/TypeScript code into SQL commands.

**Example:**

```typescript
// You write (JavaScript):
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

// Prisma generates and runs (SQL):
SELECT * FROM users WHERE email = 'user@example.com';
```

---

#### 2. 📋 **Blueprint Manager**

The file `prisma/schema.prisma` defines your entire database structure.

```prisma
model User {
  id        String   @id
  email     String   @unique
  name      String?
  role      UserRole @default(VIEWER)
  createdAt DateTime @default(now())
}
```

This tells Prisma:
- Table name: `users`
- Columns: id, email, name, role, createdAt
- Types: String, DateTime
- Constraints: unique email, default role

---

#### 3. 🔧 **Migration Manager**

When you change `schema.prisma`, Prisma updates PostgreSQL automatically.

```bash
# You edit schema → Add new field
npm run db:migrate

# Prisma creates SQL → Applies to database
```

---

#### 4. 🛡️ **Safety Guard**

Provides TypeScript type safety - catches errors before you run code.

```typescript
// ✅ This works:
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    role: 'VIEWER'
  }
})

// ❌ This gives error IMMEDIATELY:
const user = await prisma.user.create({
  data: {
    emaill: 'test@example.com', // Typo! Caught before running
    role: 'INVALID'              // Invalid value! Error shown
  }
})
```

---

#### 5. 🚀 **Query Builder**

Makes complex database queries simple.

```typescript
// Get products with their categories and images
const products = await prisma.part.findMany({
  where: { inStock: true },
  include: {
    category: true,  // Automatically joins category table
    images: true     // Gets all related images
  },
  orderBy: { createdAt: 'desc' },
  take: 10
})
```

Without Prisma, you'd need multiple SQL queries or complex JOINs!

---

## Chapter 3: How Prisma Works

### The Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│  1. YOUR CODE (JavaScript/TypeScript)               │
│     prisma.user.create({ ... })                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  2. PRISMA CLIENT (Translator)                      │
│     - Validates data                                │
│     - Generates SQL                                 │
│     - Checks types                                  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  3. POSTGRESQL (Database)                           │
│     - Executes SQL                                  │
│     - Stores/retrieves data                         │
│     - Returns results                               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  4. BACK TO YOUR CODE                               │
│     - Results as JavaScript objects                 │
│     - Type-safe and easy to use                     │
└─────────────────────────────────────────────────────┘
```

---

### Visual: Prisma as a Bridge

```
JavaScript World                    SQL World
─────────────────                   ─────────
  Your Code                         PostgreSQL
      ↓                                  ↑
      ↓         ┌──────────┐            ↑
      └────────→│  PRISMA  │────────────┘
                └──────────┘
            (The Bridge/Translator)
```

---

## Chapter 4: Prisma Schema File

### Location
```
prisma/schema.prisma
```

This is the **source of truth** for your database structure.

---

### Structure of schema.prisma

```prisma
// 1. DATABASE CONNECTION
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 2. PRISMA CLIENT CONFIGURATION
generator client {
  provider = "prisma-client-js"
}

// 3. ENUMS (Predefined options)
enum UserRole {
  ADMIN
  VIEWER
}

// 4. MODELS (Database tables)
model User {
  id        String   @id
  email     String   @unique
  name      String?
  role      UserRole @default(VIEWER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id          Int     @id @default(autoincrement())
  name        String
  description String?
  parts       Part[]  // Relationship: One category has many parts
}

model Part {
  id          Int      @id @default(autoincrement())
  name        String
  price       Float
  categoryId  Int
  category    Category @relation(fields: [categoryId], references: [id])
  inStock     Boolean  @default(true)
  images      String[] // Array of image URLs
  createdAt   DateTime @default(now())
}
```

---

### Understanding the Syntax

#### **Field Types:**
```prisma
String    // Text (e.g., "John Doe")
Int       // Integer (e.g., 1, 2, 3)
Float     // Decimal (e.g., 45.99)
Boolean   // true/false
DateTime  // Date and time
String[]  // Array of strings
```

#### **Field Modifiers:**
```prisma
String    // Required (must have value)
String?   // Optional (can be null)
String[]  // Array (multiple values)
```

#### **Attributes:**
```prisma
@id                    // Primary key
@unique                // Must be unique
@default(now())        // Default value: current time
@default(autoincrement()) // Auto-increment numbers
@updatedAt             // Auto-update on changes
```

#### **Relationships:**
```prisma
// One-to-Many
model Category {
  parts Part[]  // One category has many parts
}

model Part {
  category Category @relation(fields: [categoryId], references: [id])
  // One part belongs to one category
}
```

---

## Chapter 5: Prisma Commands

### Essential Commands

#### 1. **`npm run db:migrate`**

**Purpose:** Apply database changes

**When to use:**
- After editing `schema.prisma`
- When you add/modify/delete tables or fields

**What it does:**
1. Reads `schema.prisma`
2. Generates SQL migration
3. Applies changes to PostgreSQL
4. Updates TypeScript types automatically

**Example:**
```bash
npm run db:migrate
# Prompt: Enter migration name: add_phone_field
```

---

#### 2. **`npm run db:generate`**

**Purpose:** Regenerate Prisma Client and TypeScript types

**When to use:**
- Rarely needed (migrate does it automatically)
- When types are out of sync
- After pulling schema changes from Git

**What it does:**
1. Reads `schema.prisma`
2. Generates TypeScript types in `node_modules/.prisma/client`
3. Updates Prisma Client functions

**Example:**
```bash
npm run db:generate
# Output: ✓ Generated Prisma Client
```

---

#### 3. **`npm run db:studio`**

**Purpose:** Open visual database browser

**When to use:**
- View database contents
- Edit records manually (for testing)
- Verify data was saved correctly

**What it does:**
- Opens web interface at http://localhost:5555
- Shows all tables and data
- Like Excel for your database

**Example:**
```bash
npm run db:studio
# Opens browser at localhost:5555
```

---

#### 4. **`npm run db:reset`**

**Purpose:** Delete all data and restart fresh

**When to use:**
- During development when you want to start over
- After major schema changes
- To clear test data

**⚠️ WARNING:** This deletes ALL data!

**What it does:**
1. Drops all tables
2. Recreates tables from schema
3. Runs seed file (if exists)

**Example:**
```bash
npm run db:reset
# Prompt: Are you sure? (y/N): y
```

---

### Command Comparison

| Command | Changes Schema | Changes Database | Changes TypeScript | Deletes Data |
|---------|---------------|------------------|-------------------|--------------|
| `db:migrate` | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| `db:generate` | ❌ No | ❌ No | ✅ Yes | ❌ No |
| `db:studio` | ❌ No | ❌ No | ❌ No | ❌ No |
| `db:reset` | ❌ No | ✅ Yes | ✅ Yes | ⚠️ YES! |

---

## Chapter 6: The Correct Workflow

### ⚠️ IMPORTANT: Direction of Flow

```
ALWAYS THIS DIRECTION:
schema.prisma → PostgreSQL

NEVER THIS DIRECTION:
PostgreSQL → schema.prisma ❌
```

---

### Step-by-Step: Adding a New Field

#### **Scenario:** Add phone number to User table

**Step 1: Edit Schema**
```prisma
// File: prisma/schema.prisma

model User {
  id        String   @id
  email     String   @unique
  name      String?
  phone     String?  // ← ADD THIS LINE
  role      UserRole @default(VIEWER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Step 2: Save File**
- Press `Ctrl+S`

**Step 3: Run Migration**
```bash
npm run db:migrate
# Prompt: Name of migration: add_phone_to_users
```

**Step 4: What Happens**
```
1. Prisma reads schema.prisma
   ↓
2. Sees new "phone" field
   ↓
3. Generates SQL:
   ALTER TABLE users ADD COLUMN phone TEXT;
   ↓
4. Executes SQL on PostgreSQL
   ↓
5. Database now has phone column ✅
   ↓
6. TypeScript types updated ✅
```

**Step 5: Verify**
```bash
npm run db:studio
# Check users table - you'll see "phone" column!
```

**Step 6: Use in Code**
```typescript
// Now you can use phone field:
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    phone: '+1234567890'  // ✅ TypeScript knows this exists!
  }
})
```

---

### Step-by-Step: Adding a New Table

#### **Scenario:** Add Reviews table for products

**Step 1: Edit Schema**
```prisma
// File: prisma/schema.prisma

model Review {
  id        Int      @id @default(autoincrement())
  partId    Int
  part      Part     @relation(fields: [partId], references: [id])
  rating    Int      // 1-5 stars
  comment   String?
  createdAt DateTime @default(now())
}

// Also update Part model to add relationship:
model Part {
  id          Int      @id @default(autoincrement())
  name        String
  price       Float
  reviews     Review[] // ← ADD THIS LINE
  // ... other fields
}
```

**Step 2: Run Migration**
```bash
npm run db:migrate
# Name: add_reviews_table
```

**Step 3: PostgreSQL Now Has:**
- New table: `reviews`
- Columns: id, partId, rating, comment, createdAt
- Foreign key: partId → parts.id

**Step 4: Use in Code**
```typescript
// Create a review
const review = await prisma.review.create({
  data: {
    partId: 1,
    rating: 5,
    comment: 'Excellent quality!'
  }
})

// Get product with all reviews
const product = await prisma.part.findUnique({
  where: { id: 1 },
  include: {
    reviews: true  // Automatically fetches all reviews
  }
})
```

---

## Chapter 7: Common Mistakes to Avoid

### ❌ Mistake 1: Editing Database Directly

**Wrong:**
```sql
-- Running this directly in PostgreSQL:
ALTER TABLE users ADD COLUMN address TEXT;
```

**Problem:**
- ✅ PostgreSQL has column
- ❌ `schema.prisma` doesn't know
- ❌ TypeScript doesn't know
- ❌ Prisma can't use it

**Correct:**
```prisma
// Edit schema.prisma:
model User {
  address String?  // Add here
}

// Then run:
npm run db:migrate
```

---

### ❌ Mistake 2: Forgetting to Run Migration

**Wrong:**
```prisma
// 1. Edit schema.prisma
model User {
  phone String?  // Added
}

// 2. Immediately try to use in code:
const user = await prisma.user.create({
  data: { phone: '123' }  // ❌ ERROR! Database doesn't have phone column yet
})
```

**Correct:**
```prisma
// 1. Edit schema.prisma
model User {
  phone String?
}

// 2. Run migration:
npm run db:migrate

// 3. NOW use in code:
const user = await prisma.user.create({
  data: { phone: '123' }  // ✅ Works!
})
```

---

### ❌ Mistake 3: Not Naming Migrations Properly

**Bad names:**
```bash
npm run db:migrate
# Name: "update"       ❌ Too vague
# Name: "changes"      ❌ Unclear
# Name: "migration_1"  ❌ Not descriptive
```

**Good names:**
```bash
npm run db:migrate
# Name: "add_phone_to_users"          ✅ Clear
# Name: "create_reviews_table"        ✅ Descriptive
# Name: "add_inventory_tracking"      ✅ Meaningful
```

**Why it matters:** You'll see these names in migration history!

---

### ❌ Mistake 4: Using db:reset in Production

**Never do this:**
```bash
# In production:
npm run db:reset  # ❌❌❌ DELETES ALL CUSTOMER DATA!
```

**db:reset is for development only!**

---

## Chapter 8: Real Examples from Your Project

### Example 1: User Sync from Clerk (Currently Working!)

**File:** `src/app/api/webhooks/clerk/route.ts`

```typescript
import { prisma } from '@/lib/prisma'

// When user signs up in Clerk:
const user = await prisma.user.create({
  data: {
    id: 'clerk_user_123',        // Clerk's user ID
    email: 'user@example.com',
    name: 'John Doe',
    role: 'VIEWER'               // Default role
  }
})

console.log('✅ User created in database:', user.id)
```

**What Prisma does:**
1. Validates data matches schema
2. Generates SQL: `INSERT INTO users (id, email, name, role, createdAt, updatedAt) VALUES (...)`
3. Executes on PostgreSQL
4. Returns created user object

---

### Example 2: Fetching Products (Future - Phase 3)

**File:** `src/app/parts/page.tsx`

```typescript
import { prisma } from '@/lib/prisma'

// Server component - fetches products on server
export default async function PartsPage() {
  // Get all in-stock products with categories
  const products = await prisma.part.findMany({
    where: {
      inStock: true
    },
    include: {
      category: true  // Joins category table automatically
    },
    orderBy: {
      createdAt: 'desc'  // Newest first
    }
  })

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>Category: {product.category.name}</p>
          <p>Price: ${product.price}</p>
        </div>
      ))}
    </div>
  )
}
```

---

### Example 3: Admin Creates Product (Future - Phase 4)

**File:** `src/app/api/parts/route.ts`

```typescript
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  // Check if user is admin
  const { userId } = await auth()
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (user?.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 403 })
  }

  // Get data from request
  const data = await request.json()

  // Create product in database
  const product = await prisma.part.create({
    data: {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      categoryId: parseInt(data.categoryId),
      inStock: true,
      images: data.imageUrls  // Array of URLs from MinIO
    }
  })

  return Response.json({ success: true, product })
}
```

---

### Example 4: Search Products (Future - Phase 5)

**File:** `src/app/api/parts/search/route.ts`

```typescript
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const category = searchParams.get('category')

  const products = await prisma.part.findMany({
    where: {
      AND: [
        // Search in name or description
        query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        } : {},
        // Filter by category if provided
        category ? {
          category: { name: category }
        } : {},
        // Only in-stock items
        { inStock: true }
      ]
    },
    include: {
      category: true
    },
    take: 20  // Limit to 20 results
  })

  return Response.json(products)
}
```

---

## Chapter 9: Prisma Tools

### 1. Prisma Studio

**What it is:** Visual database browser (like Excel for your data)

**How to open:**
```bash
npm run db:studio
# Opens at http://localhost:5555
```

**Features:**
- ✅ View all tables
- ✅ Browse records
- ✅ Edit data manually
- ✅ Delete records
- ✅ Add test data
- ✅ Filter and search

**Best for:**
- Checking if data was saved correctly
- Viewing user accounts
- Testing queries
- Debugging data issues
- Manual data entry during development

**Screenshot Guide:**
```
┌────────────────────────────────────────────┐
│ Prisma Studio                              │
├────────────────────────────────────────────┤
│ Tables:          Records:                  │
│ ├─ users         ┌──────────────────────┐ │
│ ├─ categories    │ id | email | name   │ │
│ ├─ parts         │ 1  | a@ex  | John   │ │
│ ├─ orders        │ 2  | b@ex  | Jane   │ │
│ └─ reviews       └──────────────────────┘ │
└────────────────────────────────────────────┘
```

---

### 2. Prisma Migrate

**What it is:** Database version control

**How it works:**
```
prisma/migrations/
├── 20251006_add_phone_to_users/
│   └── migration.sql
├── 20251007_create_reviews_table/
│   └── migration.sql
└── 20251008_add_inventory_tracking/
    └── migration.sql
```

Each migration is tracked with:
- Timestamp
- Name
- SQL changes
- Applied date

**Benefits:**
- ✅ Version history of database changes
- ✅ Can roll back changes
- ✅ Team members get same database structure
- ✅ Track who changed what and when

---

### 3. Prisma Client

**What it is:** The code Prisma generates for you

**Location:** `node_modules/.prisma/client/`

**What it contains:**
```typescript
// Generated TypeScript types:
export type User = {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'VIEWER'
  phone: string | null
  createdAt: Date
  updatedAt: Date
}

// Generated functions:
export class PrismaClient {
  user: {
    create(...)
    findUnique(...)
    findMany(...)
    update(...)
    delete(...)
  }
  part: {
    // Same functions for Part table
  }
  // ... etc for all models
}
```

**You import it like this:**
```typescript
import { prisma } from '@/lib/prisma'

// Now use:
prisma.user.create(...)
prisma.part.findMany(...)
```

---

## Chapter 10: Quick Reference

### Common Operations Cheat Sheet

#### **Create Record**
```typescript
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: 'Test User',
    role: 'VIEWER'
  }
})
```

#### **Find One Record**
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' }
})
```

#### **Find Many Records**
```typescript
const users = await prisma.user.findMany({
  where: { role: 'ADMIN' },
  orderBy: { createdAt: 'desc' },
  take: 10  // Limit to 10
})
```

#### **Update Record**
```typescript
const user = await prisma.user.update({
  where: { id: 'user_123' },
  data: { name: 'New Name' }
})
```

#### **Delete Record**
```typescript
await prisma.user.delete({
  where: { id: 'user_123' }
})
```

#### **Count Records**
```typescript
const count = await prisma.user.count({
  where: { role: 'ADMIN' }
})
```

#### **Check If Exists**
```typescript
const exists = await prisma.user.findUnique({
  where: { email: 'test@example.com' }
}) !== null
```

#### **Get Related Data**
```typescript
const product = await prisma.part.findUnique({
  where: { id: 1 },
  include: {
    category: true,   // Include category
    reviews: true     // Include all reviews
  }
})
```

#### **Filter with Multiple Conditions**
```typescript
const products = await prisma.part.findMany({
  where: {
    AND: [
      { inStock: true },
      { price: { lte: 100 } },  // Less than or equal
      { category: { name: 'European Parts' } }
    ]
  }
})
```

---

### Commands Cheat Sheet

```bash
# Apply schema changes to database
npm run db:migrate

# Regenerate TypeScript types
npm run db:generate

# Open visual database browser
npm run db:studio

# Reset database (delete all data)
npm run db:reset

# Start Docker services
npm run docker:dev

# Sync users from Clerk (manual)
npm run clerk:sync
```

---

### Workflow Cheat Sheet

```
1. Edit prisma/schema.prisma
   ↓
2. Save file (Ctrl+S)
   ↓
3. Run: npm run db:migrate
   ↓
4. Enter migration name
   ↓
5. PostgreSQL updated ✅
   ↓
6. TypeScript types updated ✅
   ↓
7. Use in your code ✅
```

---

### Field Type Reference

```prisma
String         // Text
Int            // Integer number
Float          // Decimal number
Boolean        // true/false
DateTime       // Date and time
String?        // Optional text
String[]       // Array of text
Json           // JSON object

// Attributes
@id            // Primary key
@unique        // Must be unique
@default(...)  // Default value
@updatedAt     // Auto-update timestamp
```

---

### Helpful Resources

**Official Docs:**
- Prisma Docs: https://www.prisma.io/docs
- Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- Prisma Client API: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference

**In Your Project:**
- Schema file: `prisma/schema.prisma`
- Prisma utilities: `src/lib/prisma.ts`
- Migration files: `prisma/migrations/`

---

## Summary

### Key Takeaways

1. **Prisma is your database assistant** - Makes talking to PostgreSQL easy
2. **schema.prisma is the boss** - Always edit this first, not the database
3. **db:migrate applies changes** - Updates PostgreSQL from schema
4. **db:studio lets you view data** - Visual browser for your database
5. **TypeScript types are automatic** - Prisma keeps them in sync
6. **Never edit database directly** - Always go through Prisma

### The Golden Rule

```
Edit schema.prisma → Run db:migrate → Use in code
```

**Never:** Edit database directly → Hope Prisma syncs ❌

---

**Remember:** Prisma is your friend! It prevents mistakes, makes queries easy, and keeps everything in sync. Trust the workflow and you'll be fine! 😊

---

**Questions?** Refer to specific chapters above or check `docs/PROJECT-OVERVIEW.md` for the bigger picture!
