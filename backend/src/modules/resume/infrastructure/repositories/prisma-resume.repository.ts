import { prisma } from "../../../../database/prisma.js";
import type {
  ResumeAnalysisRecord,
  ResumeJobAnalysisResult,
  ResumeSuggestionRecord,
} from "../../domain/entities/resume-analysis.entity.js";
import type {
  ResumeRecord,
  ResumeStructuredContent,
  ResumeVersionRecord,
  ResumeVersionSource,
} from "../../domain/entities/resume.entity.js";
import type {
  CreateResumeVersionInput,
  ResumeImportLogInput,
  ResumeRepository,
} from "../../domain/repositories/resume.repository.js";

const mapContent = (value: unknown): ResumeStructuredContent => value as ResumeStructuredContent;

const mapVersion = (row: {
  id: string;
  resumeId: string;
  versionNumber: number;
  content: unknown;
  contentHash: string;
  source: string;
  createdAt: Date;
}): ResumeVersionRecord => ({
  id: row.id,
  resumeId: row.resumeId,
  versionNumber: row.versionNumber,
  content: mapContent(row.content),
  contentHash: row.contentHash,
  source: row.source as ResumeVersionSource,
  createdAt: row.createdAt,
});

const mapAnalysis = (row: {
  id: string;
  userId: string;
  resumeId: string;
  resumeVersionId: string;
  jobSourceUrl: string;
  jobExternalId: string | null;
  jobTitle: string | null;
  jobCompany: string | null;
  contentHash: string;
  result: unknown;
  matchScore: number;
  atsScore: number;
  provider: string;
  model: string;
  promptVersion: string;
  matchEngineVersion: string;
  generatedAt: Date;
}): ResumeAnalysisRecord => ({
  id: row.id,
  userId: row.userId,
  resumeId: row.resumeId,
  resumeVersionId: row.resumeVersionId,
  jobSourceUrl: row.jobSourceUrl,
  jobExternalId: row.jobExternalId,
  jobTitle: row.jobTitle,
  jobCompany: row.jobCompany,
  contentHash: row.contentHash,
  result: row.result as ResumeJobAnalysisResult,
  matchScore: row.matchScore,
  atsScore: row.atsScore,
  provider: row.provider,
  model: row.model,
  promptVersion: row.promptVersion,
  matchEngineVersion: row.matchEngineVersion,
  generatedAt: row.generatedAt,
});

export class PrismaResumeRepository implements ResumeRepository {
  async findByUserId(userId: string): Promise<ResumeRecord | null> {
    const row = await prisma.resume.findUnique({
      where: { userId },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });
    if (!row) return null;

    const currentVersion = row.currentVersionId
      ? await prisma.resumeVersion.findUnique({ where: { id: row.currentVersionId } })
      : row.versions[0] ?? null;

    return {
      id: row.id,
      userId: row.userId,
      currentVersionId: row.currentVersionId,
      currentVersion: currentVersion ? mapVersion(currentVersion) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async ensureForUser(userId: string): Promise<ResumeRecord> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    const row = await prisma.resume.create({ data: { userId } });
    return {
      id: row.id,
      userId: row.userId,
      currentVersionId: null,
      currentVersion: null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async createVersion(input: CreateResumeVersionInput): Promise<ResumeVersionRecord> {
    const last = await prisma.resumeVersion.findFirst({
      where: { resumeId: input.resumeId },
      orderBy: { versionNumber: "desc" },
    });
    const versionNumber = (last?.versionNumber ?? 0) + 1;

    const row = await prisma.resumeVersion.create({
      data: {
        resumeId: input.resumeId,
        versionNumber,
        content: input.content as object,
        contentHash: input.contentHash,
        source: input.source,
      },
    });

    return mapVersion(row);
  }

  async setCurrentVersion(resumeId: string, versionId: string): Promise<ResumeRecord> {
    const row = await prisma.resume.update({
      where: { id: resumeId },
      data: { currentVersionId: versionId },
    });
    const version = await prisma.resumeVersion.findUniqueOrThrow({ where: { id: versionId } });
    return {
      id: row.id,
      userId: row.userId,
      currentVersionId: row.currentVersionId,
      currentVersion: mapVersion(version),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async listVersions(resumeId: string): Promise<ResumeVersionRecord[]> {
    const rows = await prisma.resumeVersion.findMany({
      where: { resumeId },
      orderBy: { versionNumber: "desc" },
    });
    return rows.map(mapVersion);
  }

  async findVersionById(versionId: string, userId: string): Promise<ResumeVersionRecord | null> {
    const row = await prisma.resumeVersion.findFirst({
      where: { id: versionId, resume: { userId } },
    });
    return row ? mapVersion(row) : null;
  }

  async logImport(input: ResumeImportLogInput): Promise<void> {
    await prisma.resumeImport.create({
      data: {
        userId: input.userId,
        format: input.format,
        status: input.status,
        rawTextLength: input.rawTextLength,
        fileHash: input.fileHash ?? undefined,
        errorMessage: input.errorMessage ?? undefined,
        versionId: input.versionId ?? undefined,
      },
    });
  }

  async findAnalysisByHash(userId: string, contentHash: string): Promise<ResumeAnalysisRecord | null> {
    const row = await prisma.resumeAnalysis.findUnique({
      where: { userId_contentHash: { userId, contentHash } },
    });
    return row ? mapAnalysis(row) : null;
  }

  async saveAnalysis(input: {
    userId: string;
    resumeId: string;
    resumeVersionId: string;
    jobSourceUrl: string;
    jobExternalId?: string | null;
    jobTitle?: string | null;
    jobCompany?: string | null;
    contentHash: string;
    result: ResumeJobAnalysisResult;
    matchScore: number;
    atsScore: number;
    provider: string;
    model: string;
    promptVersion: string;
    matchEngineVersion: string;
  }): Promise<ResumeAnalysisRecord> {
    const row = await prisma.resumeAnalysis.create({
      data: {
        userId: input.userId,
        resumeId: input.resumeId,
        resumeVersionId: input.resumeVersionId,
        jobSourceUrl: input.jobSourceUrl,
        jobExternalId: input.jobExternalId ?? undefined,
        jobTitle: input.jobTitle ?? undefined,
        jobCompany: input.jobCompany ?? undefined,
        contentHash: input.contentHash,
        result: input.result as object,
        matchScore: input.matchScore,
        atsScore: input.atsScore,
        provider: input.provider,
        model: input.model,
        promptVersion: input.promptVersion,
        matchEngineVersion: input.matchEngineVersion,
      },
    });
    return mapAnalysis(row);
  }

  async saveSuggestions(
    analysisId: string,
    suggestions: ResumeJobAnalysisResult["suggestions"],
  ): Promise<ResumeSuggestionRecord[]> {
    const rows = await prisma.$transaction(
      suggestions.map((item) =>
        prisma.resumeSuggestion.create({
          data: {
            analysisId,
            type: item.type,
            section: item.section,
            reason: item.reason,
            impact: item.impact,
            suggestedText: item.suggestedText,
          },
        }),
      ),
    );

    return rows.map((row: (typeof rows)[number]) => ({
      id: row.id,
      analysisId: row.analysisId,
      type: row.type,
      section: row.section,
      reason: row.reason,
      impact: row.impact,
      suggestedText: row.suggestedText,
      status: row.status as ResumeSuggestionRecord["status"],
      appliedVersionId: row.appliedVersionId,
      createdAt: row.createdAt,
    }));
  }

  async findAnalysisById(analysisId: string, userId: string): Promise<ResumeAnalysisRecord | null> {
    const row = await prisma.resumeAnalysis.findFirst({ where: { id: analysisId, userId } });
    return row ? mapAnalysis(row) : null;
  }

  async listSuggestions(analysisId: string): Promise<ResumeSuggestionRecord[]> {
    const rows = await prisma.resumeSuggestion.findMany({
      where: { analysisId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((row: (typeof rows)[number]) => ({
      id: row.id,
      analysisId: row.analysisId,
      type: row.type,
      section: row.section,
      reason: row.reason,
      impact: row.impact,
      suggestedText: row.suggestedText,
      status: row.status as ResumeSuggestionRecord["status"],
      appliedVersionId: row.appliedVersionId,
      createdAt: row.createdAt,
    }));
  }

  async findSuggestionById(suggestionId: string, userId: string): Promise<ResumeSuggestionRecord | null> {
    const row = await prisma.resumeSuggestion.findFirst({
      where: { id: suggestionId, analysis: { userId } },
    });
    if (!row) return null;
    return {
      id: row.id,
      analysisId: row.analysisId,
      type: row.type,
      section: row.section,
      reason: row.reason,
      impact: row.impact,
      suggestedText: row.suggestedText,
      status: row.status as ResumeSuggestionRecord["status"],
      appliedVersionId: row.appliedVersionId,
      createdAt: row.createdAt,
    };
  }

  async updateSuggestionStatus(
    suggestionId: string,
    status: ResumeSuggestionRecord["status"],
    appliedVersionId?: string | null,
  ): Promise<ResumeSuggestionRecord> {
    const row = await prisma.resumeSuggestion.update({
      where: { id: suggestionId },
      data: {
        status,
        appliedVersionId: appliedVersionId ?? undefined,
      },
    });
    return {
      id: row.id,
      analysisId: row.analysisId,
      type: row.type,
      section: row.section,
      reason: row.reason,
      impact: row.impact,
      suggestedText: row.suggestedText,
      status: row.status as ResumeSuggestionRecord["status"],
      appliedVersionId: row.appliedVersionId,
      createdAt: row.createdAt,
    };
  }

  async listHistory(userId: string, limit: number) {
    const [analyses, imports] = await Promise.all([
      prisma.resumeAnalysis.findMany({
        where: { userId },
        orderBy: { generatedAt: "desc" },
        take: limit,
      }),
      prisma.resumeImport.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, format: true, status: true, createdAt: true },
      }),
    ]);

    return {
      analyses: analyses.map(mapAnalysis),
      imports,
    };
  }

  async logUsage(input: {
    userId: string;
    analysisId?: string | null;
    wasCached: boolean;
    durationMs?: number | null;
    model?: string | null;
    promptTokens?: number | null;
    completionTokens?: number | null;
  }): Promise<void> {
    await prisma.resumeAnalysisUsageLog.create({
      data: {
        userId: input.userId,
        analysisId: input.analysisId ?? undefined,
        wasCached: input.wasCached,
        durationMs: input.durationMs ?? undefined,
        model: input.model ?? undefined,
        promptTokens: input.promptTokens ?? undefined,
        completionTokens: input.completionTokens ?? undefined,
      },
    });
  }

  async countRealUsageSince(userId: string, since: Date): Promise<number> {
    return prisma.resumeAnalysisUsageLog.count({
      where: { userId, wasCached: false, createdAt: { gte: since } },
    });
  }

  async findLastRealUsageAt(userId: string): Promise<Date | null> {
    const row = await prisma.resumeAnalysisUsageLog.findFirst({
      where: { userId, wasCached: false },
      orderBy: { createdAt: "desc" },
    });
    return row?.createdAt ?? null;
  }
}

export const prismaResumeRepository = new PrismaResumeRepository();
