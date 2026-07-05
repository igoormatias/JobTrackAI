-- Calendar integration metadata (scope, sync status, account email)
ALTER TABLE "CalendarIntegration" ADD COLUMN IF NOT EXISTS "scope" TEXT;
ALTER TABLE "CalendarIntegration" ADD COLUMN IF NOT EXISTS "lastSyncAt" TIMESTAMP(3);
ALTER TABLE "CalendarIntegration" ADD COLUMN IF NOT EXISTS "lastError" TEXT;
ALTER TABLE "CalendarIntegration" ADD COLUMN IF NOT EXISTS "accountEmail" TEXT;
