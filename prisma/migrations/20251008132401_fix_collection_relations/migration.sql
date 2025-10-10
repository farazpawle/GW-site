-- CreateTable
CREATE TABLE "collection_products" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_products_pkey" PRIMARY KEY ("id")
);

-- Migrate existing manualProductIds data to collection_products table
INSERT INTO "collection_products" ("id", "collectionId", "partId", "position", "createdAt")
SELECT 
    gen_random_uuid(),
    c.id,
    unnest(c."manualProductIds") as "partId",
    row_number() OVER (PARTITION BY c.id ORDER BY ordinality) - 1 as position,
    CURRENT_TIMESTAMP
FROM collections c
CROSS JOIN LATERAL unnest(c."manualProductIds") WITH ORDINALITY
WHERE c."manualProductIds" IS NOT NULL AND array_length(c."manualProductIds", 1) > 0;

-- AlterTable
ALTER TABLE "collections" DROP COLUMN "manualProductIds",
ALTER COLUMN "filterRules" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "collection_products_collectionId_idx" ON "collection_products"("collectionId");

-- CreateIndex
CREATE INDEX "collection_products_partId_idx" ON "collection_products"("partId");

-- CreateIndex
CREATE UNIQUE INDEX "collection_products_collectionId_partId_key" ON "collection_products"("collectionId", "partId");

-- AddForeignKey
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
