import { prisma } from "../../../../database/prisma.js";
import type {
  CareerAnalysisRecord,
  CareerAnalysisResult,
} from "../../domain/entities/career-analysis.entity.js";
import type {
  AIAnalysisRepository,
  CreateUsageLogInput,
  UpsertAIAnalysisInput,
} from "../../domain/repositories/ai-analysis.repository.js";

const mapRecord = (record: {
  id: string;
  trackingId: string;
  contentHash: string;
  result: unknown;
  provider: string;
  model: string;
  promptVersion: string;
  matchEngineVersion: string;
  confidence: number | null;
  generatedAt: Date;
}): CareerAnalysisRecord => ({
  id: record.id,
  trackingId: record.trackingId,
  contentHash: record.contentHash,
  result: record.result as CareerAnalysisResult,
  provider: record.provider,
  model: record.model,
  promptVersion: record.promptVersion,
  matchEngineVersion: record.matchEngineVersion,
  confidence: record.confidence,
  generatedAt: record.generatedAt,
});

export class PrismaAIAnalysisRepository implements AIAnalysisRepository {
  async findByTrackingAndHash(trackingId: string, contentHash: string): Promise<CareerAnalysisRecord | null> {
    const record = await prisma.aIAnalysis.findUnique({
      where: { trackingId_contentHash: { trackingId, contentHash } },
    });
    return record ? mapRecord(record) : null;
  }

  async findLatestByTracking(trackingId: string): Promise<CareerAnalysisRecord | null> {
    const record = await prisma.aIAnalysis.findFirst({
      where: { trackingId },
      orderBy: { generatedAt: "desc" },
    });
    return record ? mapRecord(record) : null;
  }

  async upsert(input: UpsertAIAnalysisInput): Promise<CareerAnalysisRecord> {
    const record = await prisma.aIAnalysis.upsert({
      where: {
        trackingId_contentHash: { trackingId: input.trackingId, contentHash: input.contentHash },
      },
      create: {
        trackingId: input.trackingId,
        contentHash: input.contentHash,
        result: input.result,
        provider: input.provider,
        model: input.model,
        promptVersion: input.promptVersion,
        matchEngineVersion: input.matchEngineVersion,
        confidence: input.confidence,
      },
      update: {
        result: input.result,
        provider: input.provider,
        model: input.model,
        promptVersion: input.promptVersion,
        matchEngineVersion: input.matchEngineVersion,
        confidence: input.confidence,
        generatedAt: new Date(),
      },
    });
    return mapRecord(record);
  }

  async logUsage(input: CreateUsageLogInput): Promise<void> {
    await prisma.aIAnalysisUsageLog.create({ data: input });
  }

  async countRealUsageSince(userId: string, since: Date): Promise<number> {
    return prisma.aIAnalysisUsageLog.count({
      where: { userId, wasCached: false, createdAt: { gte: since } },
    });
  }

  async findLastRealUsageAt(userId: string): Promise<Date | null> {
    const record = await prisma.aIAnalysisUsageLog.findFirst({
      where: { userId, wasCached: false },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    return record?.createdAt ?? null;
  }
}

export const prismaAIAnalysisRepository = new PrismaAIAnalysisRepository();
