-- AlterTable
ALTER TABLE "parts" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "compareAtPrice" DECIMAL(10,2),
ADD COLUMN     "costPrice" DECIMAL(10,2),
ADD COLUMN     "hasVariants" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lowStockThreshold" INTEGER DEFAULT 10,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "trackInventory" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "groupType" TEXT NOT NULL,
    "groupValues" JSONB NOT NULL,
    "layout" TEXT NOT NULL DEFAULT 'grid',
    "sortBy" TEXT NOT NULL DEFAULT 'name',
    "itemsPerPage" INTEGER NOT NULL DEFAULT 12,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "openNewTab" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "pageId" TEXT,
    "externalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "filterRules" JSONB NOT NULL,
    "manualProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "useManual" BOOLEAN NOT NULL DEFAULT false,
    "layout" TEXT NOT NULL DEFAULT 'grid',
    "sortBy" TEXT NOT NULL DEFAULT 'name',
    "itemsPerPage" INTEGER NOT NULL DEFAULT 12,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "price" DECIMAL(10,2),
    "compareAtPrice" DECIMAL(10,2),
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_slug_idx" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_published_idx" ON "pages"("published");

-- CreateIndex
CREATE INDEX "menu_items_parentId_idx" ON "menu_items"("parentId");

-- CreateIndex
CREATE INDEX "menu_items_position_idx" ON "menu_items"("position");

-- CreateIndex
CREATE INDEX "menu_items_visible_idx" ON "menu_items"("visible");

-- CreateIndex
CREATE UNIQUE INDEX "collections_slug_key" ON "collections"("slug");

-- CreateIndex
CREATE INDEX "collections_slug_idx" ON "collections"("slug");

-- CreateIndex
CREATE INDEX "collections_published_idx" ON "collections"("published");

-- CreateIndex
CREATE INDEX "product_variants_partId_idx" ON "product_variants"("partId");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "parts_sku_idx" ON "parts"("sku");

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
