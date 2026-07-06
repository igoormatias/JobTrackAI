-- Smart notifications: category, priority, soft delete

ALTER TABLE "Notification" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'system';
ALTER TABLE "Notification" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE "Notification" ADD COLUMN "deletedAt" TIMESTAMP(3);

UPDATE "Notification" SET "category" = 'jobs'
WHERE "type" IN ('new_job', 'recommendation', 'job_closed');

UPDATE "Notification" SET "category" = 'pipeline'
WHERE "type" = 'pipeline_change';

UPDATE "Notification" SET "category" = 'calendar'
WHERE "type" = 'interview_reminder';

CREATE INDEX "Notification_userId_category_createdAt_idx" ON "Notification"("userId", "category", "createdAt");
