/**
 * Extended Prisma Types
 * 
 * This file extends the Prisma User type to include RBAC fields.
 * Use this until TypeScript language server picks up the regenerated Prisma client.
 */

import { User as PrismaUser } from '@prisma/client';

// Extended User type with RBAC fields
export interface UserWithRBAC extends PrismaUser {
  permissions: string[];
  roleLevel: number;
}

// Re-export everything else from Prisma
export * from '@prisma/client';
export type { UserWithRBAC as User };
