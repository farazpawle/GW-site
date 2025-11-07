-- CreateTable
CREATE TABLE "rbac_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rbac_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rbac_logs_actorId_createdAt_idx" ON "rbac_logs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "rbac_logs_targetId_createdAt_idx" ON "rbac_logs"("targetId", "createdAt");

-- CreateIndex
CREATE INDEX "rbac_logs_action_createdAt_idx" ON "rbac_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "rbac_logs_createdAt_idx" ON "rbac_logs"("createdAt");
