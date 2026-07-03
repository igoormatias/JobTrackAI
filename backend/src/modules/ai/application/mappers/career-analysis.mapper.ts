import type { CareerAnalysisRecord } from "../../domain/entities/career-analysis.entity.js";
import { AI_CAREER_ENGINE_VERSION, type CareerAnalysisResponseDto } from "../dto/career-analysis-response.dto.js";

export const toCareerAnalysisResponseDto = (
  record: CareerAnalysisRecord,
  options: { cached: boolean; stale?: boolean },
): CareerAnalysisResponseDto => ({
  ...record.result,
  confidence: record.confidence ?? record.result.confidence,
  generatedAt: record.generatedAt.toISOString(),
  provider: record.provider,
  model: record.model,
  engineVersion: AI_CAREER_ENGINE_VERSION,
  matchEngineVersion: record.matchEngineVersion,
  cached: options.cached,
  stale: options.stale,
});
