/*
  Warnings:

  - The values [EMAIL] on the enum `SettingsCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SettingsCategory_new" AS ENUM ('GENERAL', 'CONTACT', 'SEO', 'SHIPPING');
-- Reassign legacy EMAIL settings to GENERAL before altering enum
UPDATE "settings"
SET "category" = 'GENERAL'
WHERE "category" = 'EMAIL';

ALTER TABLE "settings" ALTER COLUMN "category" TYPE "SettingsCategory_new" USING ("category"::text::"SettingsCategory_new");
ALTER TYPE "SettingsCategory" RENAME TO "SettingsCategory_old";
ALTER TYPE "SettingsCategory_new" RENAME TO "SettingsCategory";
DROP TYPE "public"."SettingsCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "contact_messages" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
