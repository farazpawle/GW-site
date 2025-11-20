/*
  Warnings:

  - The values [PAYMENT] on the enum `SettingsCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `barcode` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `lowStockThreshold` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `trackInventory` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `barcode` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `stockQuantity` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refunds` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `webhook_logs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sku]` on the table `parts` will be added. If there are existing duplicate values, this will fail.
  - Made the column `sku` on table `parts` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "QuoteRequestStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESPONDED', 'CLOSED');

-- AlterEnum
BEGIN;
CREATE TYPE "SettingsCategory_new" AS ENUM ('GENERAL', 'CONTACT', 'SEO', 'EMAIL', 'SHIPPING');
ALTER TABLE "settings" ALTER COLUMN "category" TYPE "SettingsCategory_new" USING ("category"::text::"SettingsCategory_new");
ALTER TYPE "SettingsCategory" RENAME TO "SettingsCategory_old";
ALTER TYPE "SettingsCategory_new" RENAME TO "SettingsCategory";
DROP TYPE "public"."SettingsCategory_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_partId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."refunds" DROP CONSTRAINT "refunds_paymentId_fkey";

-- DropIndex
DROP INDEX "public"."parts_sku_idx";

-- DropIndex
DROP INDEX "public"."product_variants_sku_idx";

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "content" TEXT,
ADD COLUMN     "pageType" TEXT NOT NULL DEFAULT 'dynamic',
ALTER COLUMN "groupType" DROP NOT NULL,
ALTER COLUMN "groupValues" DROP NOT NULL;

-- AlterTable
ALTER TABLE "parts" DROP COLUMN "barcode",
DROP COLUMN "costPrice",
DROP COLUMN "lowStockThreshold",
DROP COLUMN "trackInventory",
ALTER COLUMN "sku" SET NOT NULL;

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "barcode",
DROP COLUMN "sku",
DROP COLUMN "stockQuantity";

-- DropTable
DROP TABLE "public"."customers";

-- DropTable
DROP TABLE "public"."order_items";

-- DropTable
DROP TABLE "public"."orders";

-- DropTable
DROP TABLE "public"."payments";

-- DropTable
DROP TABLE "public"."refunds";

-- DropTable
DROP TABLE "public"."webhook_logs";

-- DropEnum
DROP TYPE "public"."OrderStatus";

-- DropEnum
DROP TYPE "public"."PaymentProvider";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."RefundReason";

-- DropEnum
DROP TYPE "public"."RefundStatus";

-- CreateTable
CREATE TABLE "quote_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "message" TEXT,
    "status" "QuoteRequestStatus" NOT NULL DEFAULT 'PENDING',
    "products" JSONB,
    "adminNotes" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_queries" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "resultsCount" INTEGER NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_analytics" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastSearched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "part_cross_references" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "referencedPartId" TEXT,
    "referenceType" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "part_cross_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oem_part_numbers" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "oemPartNumber" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oem_part_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_compatibility" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "yearStart" INTEGER NOT NULL,
    "yearEnd" INTEGER NOT NULL,
    "engine" TEXT,
    "trim" TEXT,
    "position" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_compatibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quote_requests_status_idx" ON "quote_requests"("status");

-- CreateIndex
CREATE INDEX "quote_requests_email_idx" ON "quote_requests"("email");

-- CreateIndex
CREATE INDEX "quote_requests_createdAt_idx" ON "quote_requests"("createdAt");

-- CreateIndex
CREATE INDEX "search_queries_query_idx" ON "search_queries"("query");

-- CreateIndex
CREATE INDEX "search_queries_createdAt_idx" ON "search_queries"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "search_analytics_term_key" ON "search_analytics"("term");

-- CreateIndex
CREATE INDEX "search_analytics_count_idx" ON "search_analytics"("count");

-- CreateIndex
CREATE INDEX "part_cross_references_partId_idx" ON "part_cross_references"("partId");

-- CreateIndex
CREATE INDEX "part_cross_references_referencedPartId_idx" ON "part_cross_references"("referencedPartId");

-- CreateIndex
CREATE INDEX "part_cross_references_brandName_idx" ON "part_cross_references"("brandName");

-- CreateIndex
CREATE INDEX "oem_part_numbers_partId_idx" ON "oem_part_numbers"("partId");

-- CreateIndex
CREATE INDEX "oem_part_numbers_manufacturer_idx" ON "oem_part_numbers"("manufacturer");

-- CreateIndex
CREATE INDEX "oem_part_numbers_oemPartNumber_idx" ON "oem_part_numbers"("oemPartNumber");

-- CreateIndex
CREATE UNIQUE INDEX "oem_part_numbers_partId_manufacturer_oemPartNumber_key" ON "oem_part_numbers"("partId", "manufacturer", "oemPartNumber");

-- CreateIndex
CREATE INDEX "vehicle_compatibility_partId_idx" ON "vehicle_compatibility"("partId");

-- CreateIndex
CREATE INDEX "vehicle_compatibility_make_model_idx" ON "vehicle_compatibility"("make", "model");

-- CreateIndex
CREATE INDEX "vehicle_compatibility_yearStart_yearEnd_idx" ON "vehicle_compatibility"("yearStart", "yearEnd");

-- CreateIndex
CREATE INDEX "pages_pageType_idx" ON "pages"("pageType");

-- CreateIndex
CREATE UNIQUE INDEX "parts_sku_key" ON "parts"("sku");

-- AddForeignKey
ALTER TABLE "part_cross_references" ADD CONSTRAINT "part_cross_references_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_cross_references" ADD CONSTRAINT "part_cross_references_referencedPartId_fkey" FOREIGN KEY ("referencedPartId") REFERENCES "parts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oem_part_numbers" ADD CONSTRAINT "oem_part_numbers_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_compatibility" ADD CONSTRAINT "vehicle_compatibility_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
