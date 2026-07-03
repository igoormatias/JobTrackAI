-- AlterTable
ALTER TABLE "Job" ADD COLUMN "expiresAt" TIMESTAMP(3),
ADD COLUMN "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN "removedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Job_status_publishedAt_idx" ON "Job"("status", "publishedAt");
CREATE INDEX "Job_source_status_idx" ON "Job"("source", "status");
