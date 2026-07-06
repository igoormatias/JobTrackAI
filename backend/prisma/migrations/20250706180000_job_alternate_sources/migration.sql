-- Dedup v2: alternate sources for cross-provider job matching (ADR-035)
CREATE TABLE "JobAlternateSource" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "contentHash" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobAlternateSource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JobAlternateSource_source_externalId_key" ON "JobAlternateSource"("source", "externalId");
CREATE INDEX "JobAlternateSource_jobId_idx" ON "JobAlternateSource"("jobId");

ALTER TABLE "JobAlternateSource" ADD CONSTRAINT "JobAlternateSource_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
