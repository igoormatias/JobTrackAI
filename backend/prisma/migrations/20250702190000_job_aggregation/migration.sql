-- Job Aggregation Engine (Etapa 17)
ALTER TABLE "Job" ADD COLUMN "contentHash" TEXT;
CREATE INDEX "Job_contentHash_idx" ON "Job"("contentHash");
CREATE INDEX "Job_sourceUrl_idx" ON "Job"("sourceUrl");

-- Drop blockedSkills from Profile (Etapa 17)
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "blockedSkills";

-- Provider registry
CREATE TABLE "JobProviderRegistry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastHealthAt" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobProviderRegistry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobProviderRegistry_name_key" ON "JobProviderRegistry"("name");

-- Provider execution history
CREATE TABLE "ProviderExecution" (
    "id" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "foundCount" INTEGER NOT NULL DEFAULT 0,
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "duplicateCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "ProviderExecution_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProviderExecution_providerName_startedAt_idx" ON "ProviderExecution"("providerName", "startedAt");
CREATE INDEX "ProviderExecution_status_idx" ON "ProviderExecution"("status");

-- Per-job import records
CREATE TABLE "JobImport" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "externalId" TEXT,
    "sourceUrl" TEXT,
    "contentHash" TEXT,
    "status" TEXT NOT NULL,
    "jobId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobImport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JobImport_executionId_idx" ON "JobImport"("executionId");
CREATE INDEX "JobImport_providerName_idx" ON "JobImport"("providerName");
CREATE INDEX "JobImport_contentHash_idx" ON "JobImport"("contentHash");

ALTER TABLE "JobImport" ADD CONSTRAINT "JobImport_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "ProviderExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed provider registry
INSERT INTO "JobProviderRegistry" ("id", "name", "displayName", "enabled", "updatedAt")
VALUES
  ('prov_gupy', 'gupy', 'Gupy', true, CURRENT_TIMESTAMP),
  ('prov_linkedin', 'linkedin', 'LinkedIn', false, CURRENT_TIMESTAMP),
  ('prov_programathor', 'programathor', 'Programathor', false, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;
