-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "isPermanent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "isPermanent" BOOLEAN NOT NULL DEFAULT false;
