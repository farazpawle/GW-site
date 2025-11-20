-- AlterTable
ALTER TABLE "parts" ADD COLUMN     "application" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "showcaseOrder" INTEGER NOT NULL DEFAULT 999,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "warranty" TEXT;

-- CreateIndex
CREATE INDEX "parts_published_showcaseOrder_idx" ON "parts"("published", "showcaseOrder");

-- CreateIndex
CREATE INDEX "parts_published_categoryId_idx" ON "parts"("published", "categoryId");

-- CreateIndex
CREATE INDEX "parts_published_featured_idx" ON "parts"("published", "featured");
