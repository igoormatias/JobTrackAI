-- ApplicationProcess (JobTracking) extended fields
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "recruiterLinkedin" TEXT;
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "JobTracking" ADD COLUMN IF NOT EXISTS "salaryExpectation" JSONB;
