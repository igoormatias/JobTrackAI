-- Etapa 18: AI Career Intelligence + Skills Catalog

CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OFFICIAL',
    "area" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

CREATE TABLE "SkillAlias" (
    "id" TEXT NOT NULL,
    "aliasSlug" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "SkillAlias_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SkillAlias_aliasSlug_key" ON "SkillAlias"("aliasSlug");
CREATE INDEX "SkillAlias_skillId_idx" ON "SkillAlias"("skillId");

CREATE TABLE "UserSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "status" TEXT NOT NULL DEFAULT 'OFFICIAL',

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserSkill_userId_skillId_key" ON "UserSkill"("userId", "skillId");
CREATE INDEX "UserSkill_userId_idx" ON "UserSkill"("userId");

CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "matchEngineVersion" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AIAnalysis_trackingId_contentHash_key" ON "AIAnalysis"("trackingId", "contentHash");
CREATE INDEX "AIAnalysis_trackingId_generatedAt_idx" ON "AIAnalysis"("trackingId", "generatedAt");

CREATE TABLE "AIAnalysisUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackingId" TEXT,
    "wasCached" BOOLEAN NOT NULL DEFAULT false,
    "durationMs" INTEGER,
    "model" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAnalysisUsageLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AIAnalysisUsageLog_userId_createdAt_idx" ON "AIAnalysisUsageLog"("userId", "createdAt");

ALTER TABLE "SkillAlias" ADD CONSTRAINT "SkillAlias_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_trackingId_fkey" FOREIGN KEY ("trackingId") REFERENCES "JobTracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIAnalysisUsageLog" ADD CONSTRAINT "AIAnalysisUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
