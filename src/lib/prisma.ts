import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
// Prevents multiple instances in development with hot reload

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// For build-time without DATABASE_URL, create a mock client
const createPrismaClient = () => {
  // During build without DATABASE_URL, return a mock client
  if (!process.env.DATABASE_URL && process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn('⚠️ DATABASE_URL not set during build. Using mock Prisma client.');
    return new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://mock:mock@localhost:5432/mock'
        }
      }
    });
  }

  return new PrismaClient({
    // Reduced logging: only errors and warnings, no queries to reduce console noise
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Connection pooling configuration for better performance
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

// Connection health check for better reliability
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
