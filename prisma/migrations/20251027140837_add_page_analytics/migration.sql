-- CreateTable
CREATE TABLE "page_analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "productViews" INTEGER NOT NULL DEFAULT 0,
    "categoryViews" INTEGER NOT NULL DEFAULT 0,
    "inquiries" INTEGER NOT NULL DEFAULT 0,
    "quoteRequests" INTEGER NOT NULL DEFAULT 0,
    "newProducts" INTEGER NOT NULL DEFAULT 0,
    "updatedProducts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_analytics_date_key" ON "page_analytics"("date");

-- CreateIndex
CREATE INDEX "page_analytics_date_idx" ON "page_analytics"("date");
