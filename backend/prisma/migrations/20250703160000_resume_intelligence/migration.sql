-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResumeVersion" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "contentHash" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResumeImport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rawTextLength" INTEGER NOT NULL DEFAULT 0,
    "fileHash" TEXT,
    "errorMessage" TEXT,
    "versionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeImport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResumeAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "resumeVersionId" TEXT NOT NULL,
    "jobSourceUrl" TEXT NOT NULL,
    "jobExternalId" TEXT,
    "jobTitle" TEXT,
    "jobCompany" TEXT,
    "contentHash" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "matchScore" INTEGER NOT NULL DEFAULT 0,
    "atsScore" INTEGER NOT NULL DEFAULT 0,
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "matchEngineVersion" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResumeSuggestion" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "suggestedText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "appliedVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeSuggestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResumeAnalysisUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisId" TEXT,
    "wasCached" BOOLEAN NOT NULL DEFAULT false,
    "durationMs" INTEGER,
    "model" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeAnalysisUsageLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Resume_userId_key" ON "Resume"("userId");
CREATE UNIQUE INDEX "ResumeVersion_resumeId_versionNumber_key" ON "ResumeVersion"("resumeId", "versionNumber");
CREATE INDEX "ResumeVersion_resumeId_versionNumber_idx" ON "ResumeVersion"("resumeId", "versionNumber" DESC);
CREATE INDEX "ResumeVersion_contentHash_idx" ON "ResumeVersion"("contentHash");
CREATE INDEX "ResumeImport_userId_createdAt_idx" ON "ResumeImport"("userId", "createdAt");
CREATE UNIQUE INDEX "ResumeAnalysis_userId_contentHash_key" ON "ResumeAnalysis"("userId", "contentHash");
CREATE INDEX "ResumeAnalysis_userId_generatedAt_idx" ON "ResumeAnalysis"("userId", "generatedAt");
CREATE INDEX "ResumeAnalysis_resumeVersionId_idx" ON "ResumeAnalysis"("resumeVersionId");
CREATE INDEX "ResumeSuggestion_analysisId_status_idx" ON "ResumeSuggestion"("analysisId", "status");
CREATE INDEX "ResumeAnalysisUsageLog_userId_createdAt_idx" ON "ResumeAnalysisUsageLog"("userId", "createdAt");

ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeVersion" ADD CONSTRAINT "ResumeVersion_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeImport" ADD CONSTRAINT "ResumeImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeImport" ADD CONSTRAINT "ResumeImport_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ResumeVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "ResumeVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeSuggestion" ADD CONSTRAINT "ResumeSuggestion_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "ResumeAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeSuggestion" ADD CONSTRAINT "ResumeSuggestion_appliedVersionId_fkey" FOREIGN KEY ("appliedVersionId") REFERENCES "ResumeVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ResumeAnalysisUsageLog" ADD CONSTRAINT "ResumeAnalysisUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
