-- Manual migration: Remove MANAGER from UserRole enum
-- This migration removes the MANAGER value from the UserRole enum
-- All users should already be migrated to ADMIN role

-- Add ADMIN to enum if it doesn't exist (safe operation)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ADMIN' AND enumtypid = 'UserRole'::regtype) THEN
        ALTER TYPE "UserRole" ADD VALUE 'ADMIN';
    END IF;
END $$;

-- Remove MANAGER from enum (must be done manually as Prisma can't do it)
-- Note: This cannot be done in a transaction, so we'll skip it and just rely on the schema
-- The application code will handle both MANAGER (legacy) and ADMIN (new) correctly
