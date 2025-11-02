-- AlterTable
ALTER TABLE "parts" ADD COLUMN     "relatedProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
