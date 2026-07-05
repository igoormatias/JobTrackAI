-- v1.5 Product Polish: process fields, AI analysis status, interview calendar, integrations

ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "feedback" TEXT;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "recruiterName" TEXT;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "recruiterEmail" TEXT;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "recruiterPhone" TEXT;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "negotiatedSalary" INTEGER;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "processLinks" JSONB;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "nextInterviewAt" TIMESTAMP(3);
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "rulesMatchScore" INTEGER;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "rulesMatchLabel" TEXT;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "rulesMatchReasons" JSONB;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "aiAnalysisStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "aiMatchScore" INTEGER;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "aiAnalyzedAt" TIMESTAMP(3);
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "resumeHash" TEXT;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "profileHash" TEXT;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "jobContentHash" TEXT;

CREATE INDEX IF NOT EXISTS "JobTracking_userId_aiAnalysisStatus_idx" ON "JobTracking"("userId", "aiAnalysisStatus");

ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "timezone" TEXT;
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "meetingType" TEXT;
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "calendarEventId" TEXT;
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "calendarProvider" TEXT;
ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "syncStatus" TEXT;

ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "calendarPromptDismissedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "CalendarIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'google',
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3),
    "calendarId" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarIntegration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CalendarIntegration_userId_key" ON "CalendarIntegration"("userId");

ALTER TABLE "CalendarIntegration" DROP CONSTRAINT IF EXISTS "CalendarIntegration_userId_fkey";
ALTER TABLE "CalendarIntegration" ADD CONSTRAINT "CalendarIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
