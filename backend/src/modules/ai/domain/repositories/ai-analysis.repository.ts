import type { CareerAnalysisRecord, CareerAnalysisResult } from "../entities/career-analysis.entity.js";

export type UpsertAIAnalysisInput = {
  trackingId: string;
  contentHash: string;
  result: CareerAnalysisResult;
  provider: string;
  model: string;
  promptVersion: string;
  matchEngineVersion: string;
  confidence: number | null;
};

export type CreateUsageLogInput = {
  userId: string;
  trackingId?: string;
  wasCached: boolean;
  durationMs?: number;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
};

export interface AIAnalysisRepository {
  findByTrackingAndHash(trackingId: string, contentHash: string): Promise<CareerAnalysisRecord | null>;
  findLatestByTracking(trackingId: string): Promise<CareerAnalysisRecord | null>;
  upsert(input: UpsertAIAnalysisInput): Promise<CareerAnalysisRecord>;
  logUsage(input: CreateUsageLogInput): Promise<void>;
  countRealUsageSince(userId: string, since: Date): Promise<number>;
  findLastRealUsageAt(userId: string): Promise<Date | null>;
}
