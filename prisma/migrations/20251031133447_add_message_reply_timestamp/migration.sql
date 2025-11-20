/*
  Warnings:

  - Added the required column `updatedAt` to the `contact_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add columns with proper handling of existing data
-- First add repliedAt as nullable (no issues)
ALTER TABLE "contact_messages" ADD COLUMN "repliedAt" TIMESTAMP(3);

-- Add updatedAt with default value for existing rows
ALTER TABLE "contact_messages" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- Remove the default for future inserts (Prisma will handle it)
ALTER TABLE "contact_messages" ALTER COLUMN "updatedAt" DROP DEFAULT;
