import { env } from "../../../../config/env.js";
import { logger } from "../../../../config/logger.js";
import { prisma } from "../../../../database/prisma.js";
import { AppError } from "../../../../shared/errors/app-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { MATCH_ENGINE_VERSION } from "../../../../shared/domain/match-weights.js";
import { parseJobMetadata } from "../../../../shared/utils/job-metadata.js";
import {
  matchEngineService,
  type MatchProfileInput,
} from "../../../match/domain/services/match-engine.service.js";
import type { AnalysisSnapshot } from "../../domain/entities/career-analysis.entity.js";
import type { AIProviderPort } from "../../domain/ports/ai-provider.port.js";
import type { AIAnalysisRepository } from "../../domain/repositories/ai-analysis.repository.js";
import type {
  CareerAnalysisContextRepository,
  UserSkillRepository,
} from "../../domain/repositories/skill-catalog.repository.js";
import { computeAnalysisHash } from "../../domain/services/compute-analysis-hash.service.js";
import { SkillNormalizer } from "../../domain/services/skill-normalizer.service.js";
import { resolveGeminiModel } from "../../infrastructure/providers/gemini.provider.js";
import type { CareerAnalysisResponseDto } from "../dto/career-analysis-response.dto.js";
import { toCareerAnalysisResponseDto } from "../mappers/career-analysis.mapper.js";

const startOfUtcDay = (date = new Date()): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const normalizeStringList = (values: unknown): string[] => {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => {
      if (typeof value === "string") return value.trim();
      if (value && typeof value === "object" && "name" in value) {
        const name = (value as { name?: unknown }).name;
        return typeof name === "string" ? name.trim() : "";
      }
      return "";
    })
    .filter(Boolean);
};

const normalizeTechnologyNames = (values: unknown): string[] => {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => {
      if (typeof value === "string") return value.trim();
      if (value && typeof value === "object" && "name" in value) {
        const name = (value as { name?: unknown }).name;
        return typeof name === "string" ? name.trim() : "";
      }
      return "";
    })
    .filter(Boolean);
};

export class CareerAnalysisService {
  constructor(
    private readonly contextRepo: CareerAnalysisContextRepository,
    private readonly analysisRepo: AIAnalysisRepository,
    private readonly userSkillRepo: UserSkillRepository,
    private readonly provider: AIProviderPort,
    private readonly skillNormalizer: SkillNormalizer,
  ) {}

  async getLatest(userId: string, trackingId: string): Promise<CareerAnalysisResponseDto | null> {
    const context = await this.contextRepo.loadForUser(userId, trackingId);
    if (!context) throw new NotFoundError("Tracking not found");

    const latest = await this.analysisRepo.findLatestByTracking(trackingId);
    if (!latest) return null;

    return toCareerAnalysisResponseDto(latest, { cached: true });
  }

  async generate(
    userId: string,
    trackingId: string,
    refresh: boolean,
  ): Promise<CareerAnalysisResponseDto> {
    try {
      const startedAt = Date.now();
      const context = await this.contextRepo.loadForUser(userId, trackingId);
      if (!context) throw new NotFoundError("Tracking not found");

      const snapshot = await this.buildSnapshot(context);
      const contentHash = computeAnalysisHash(snapshot);

      const cached = await this.analysisRepo.findByTrackingAndHash(trackingId, contentHash);
      if (cached) {
        await this.analysisRepo.logUsage({
          userId,
          trackingId,
          wasCached: true,
          durationMs: Date.now() - startedAt,
          model: cached.model,
        });
        await this.markAnalysisStatus(trackingId, true);
        logger.info({ userId, trackingId, cache: "hit" }, "Career analysis cache hit");
        return toCareerAnalysisResponseDto(cached, { cached: true });
      }

      if (!refresh) {
        const latest = await this.analysisRepo.findLatestByTracking(trackingId);
        if (latest) {
          await this.analysisRepo.logUsage({
            userId,
            trackingId,
            wasCached: true,
            durationMs: Date.now() - startedAt,
            model: latest.model,
          });
          return toCareerAnalysisResponseDto(latest, { cached: true, stale: true });
        }
      }

      await this.assertRateLimits(userId);

      const model = resolveGeminiModel();
      const raw = await this.provider.analyzeCareer({ snapshot, model });

      const stored = await this.analysisRepo.upsert({
        trackingId,
        contentHash,
        result: raw,
        provider: this.provider.providerName,
        model,
        promptVersion: env.PROMPT_VERSION,
        matchEngineVersion: MATCH_ENGINE_VERSION,
        confidence: raw.confidence,
      });

      await this.analysisRepo.logUsage({
        userId,
        trackingId,
        wasCached: false,
        durationMs: Date.now() - startedAt,
        model,
        promptTokens: raw.promptTokens,
        completionTokens: raw.completionTokens,
      });

      await this.markAnalysisStatus(trackingId, false);

      logger.info(
        {
          userId,
          trackingId,
          cache: "miss",
          durationMs: Date.now() - startedAt,
          model,
          promptTokens: raw.promptTokens,
          completionTokens: raw.completionTokens,
        },
        "Career analysis generated",
      );

      return toCareerAnalysisResponseDto(stored, { cached: false });
    } catch (error) {
      if (error instanceof AppError || error instanceof NotFoundError) throw error;
      logger.error({ error, userId, trackingId }, "Career analysis generation failed");
      throw new AppError("Failed to generate career analysis", 502, "AI_ANALYSIS_FAILED");
    }
  }

  private async markAnalysisStatus(trackingId: string, cached: boolean): Promise<void> {
    await prisma.jobTracking.update({
      where: { id: trackingId },
      data: {
        aiAnalysisStatus: cached ? "CACHED" : "COMPLETED",
        aiAnalyzedAt: new Date(),
      },
    });
  }

  private async assertRateLimits(userId: string): Promise<void> {
    const since = startOfUtcDay();
    const count = await this.analysisRepo.countRealUsageSince(userId, since);
    if (count >= env.AI_CAREER_DAILY_LIMIT) {
      throw new AppError("Daily AI analysis limit exceeded", 429, "AI_RATE_LIMIT_EXCEEDED");
    }

    const lastUsage = await this.analysisRepo.findLastRealUsageAt(userId);
    if (lastUsage && Date.now() - lastUsage.getTime() < env.AI_CAREER_DEBOUNCE_MS) {
      throw new AppError("Please wait before requesting another AI analysis", 429, "AI_DEBOUNCE");
    }
  }

  private async buildSnapshot(
    context: Awaited<ReturnType<CareerAnalysisContextRepository["loadForUser"]>> & object,
  ): Promise<AnalysisSnapshot> {
    const metadata = parseJobMetadata(context.job.metadata as never);
    const technologyNames = normalizeTechnologyNames(metadata.technologies);
    const requirements = normalizeStringList(metadata.requirements);
    const technologies = technologyNames.map((name) => ({ id: name, name, slug: name.toLowerCase() }));

    const userSkills = await this.userSkillRepo.listByUserId(context.userId);
    const skillNames =
      userSkills.length > 0 ? userSkills.map((s) => s.skillName) : context.profile.skillNames ?? [];

    const normalized = await this.skillNormalizer.compare(skillNames, technologyNames);

    const matchProfile: MatchProfileInput = {
      area: context.profile.area,
      seniority: context.profile.seniority,
      modality: context.profile.modality,
      location: context.profile.location,
      skillNames,
    };

    const matchJob = {
      title: context.job.title ?? "",
      area: context.job.area,
      seniority: context.job.seniority,
      modality: context.job.modality,
      location: null,
      salaryMin: null,
      salaryMax: null,
      technologies,
      requirements,
    };

    const match = matchEngineService.compute(matchProfile, matchJob);

    return {
      job: {
        id: context.job.id,
        title: context.job.title,
        companyName: context.job.companyName,
        description: context.job.description ?? "",
        seniority: context.job.seniority,
        modality: context.job.modality,
        technologySlugs: normalized.matched.concat(normalized.missing),
        requirementSlugs: requirements.map((r) => r.toLowerCase()),
      },
      profile: {
        area: context.profile.area,
        seniority: context.profile.seniority,
        modality: context.profile.modality,
        location: context.profile.location,
        salaryBand: context.profile.salaryBand,
        userSkills:
          userSkills.length > 0
            ? userSkills
            : skillNames.map((name) => ({
                skillSlug: name.toLowerCase(),
                skillName: name,
                level: "INTERMEDIATE" as const,
                status: "OFFICIAL" as const,
              })),
      },
      tracking: {
        stage: context.stage,
        notes: context.notes,
        priority: context.priority,
      },
      timeline: context.timeline.map((event) => ({
        type: event.type,
        title: event.title,
        occurredAt: event.occurredAt.toISOString(),
      })),
      match: {
        score: match.score,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills.map((s) => s.name),
        engineVersion: match.engineVersion,
      },
      meta: {
        promptVersion: env.PROMPT_VERSION,
        matchEngineVersion: MATCH_ENGINE_VERSION,
        model: resolveGeminiModel(),
      },
    };
  }
}
