-- AlterTable Job: catalog support
ALTER TABLE "Job" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "companySlug" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "seniority" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "isCatalog" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "Job_isCatalog_idx" ON "Job"("isCatalog");
CREATE INDEX IF NOT EXISTS "Job_companySlug_idx" ON "Job"("companySlug");

-- JobTracking indexes
CREATE INDEX IF NOT EXISTS "JobTracking_userId_isFavorite_idx" ON "JobTracking"("userId", "isFavorite");
CREATE INDEX IF NOT EXISTS "JobTracking_userId_priority_idx" ON "JobTracking"("userId", "priority");
CREATE INDEX IF NOT EXISTS "JobTracking_userId_visibility_idx" ON "JobTracking"("userId", "visibility");

-- JobView
CREATE TABLE IF NOT EXISTS "JobView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobView_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "JobView_userId_jobId_key" ON "JobView"("userId", "jobId");
CREATE INDEX IF NOT EXISTS "JobView_userId_idx" ON "JobView"("userId");
ALTER TABLE "JobView" ADD CONSTRAINT "JobView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobView" ADD CONSTRAINT "JobView_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Interview
CREATE TABLE IF NOT EXISTS "Interview" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "link" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Interview_trackingId_scheduledAt_idx" ON "Interview"("trackingId", "scheduledAt");
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_trackingId_fkey" FOREIGN KEY ("trackingId") REFERENCES "JobTracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
