-- AlterTable
ALTER TABLE "Job" ADD COLUMN "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Job_source_externalId_key" ON "Job"("source", "externalId");

-- CreateIndex
CREATE INDEX "Job_isCatalog_status_publishedAt_idx" ON "Job"("isCatalog", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Job_area_idx" ON "Job"("area");

-- CreateIndex
CREATE INDEX "Job_seniority_idx" ON "Job"("seniority");

-- CreateIndex
CREATE INDEX "Job_modality_idx" ON "Job"("modality");

-- CreateIndex
CREATE INDEX "Job_source_idx" ON "Job"("source");

-- CreateIndex
CREATE INDEX "Job_publishedAt_idx" ON "Job"("publishedAt");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");
