import { env } from "../../../../config/env.js";
import { geminiProvider, resolveGeminiModel } from "../../../ai/infrastructure/providers/gemini.provider.js";
import { prismaSkillCatalogRepository } from "../../../ai/infrastructure/repositories/prisma-skill-catalog.repository.js";
import { SkillNormalizer } from "../../../ai/domain/services/skill-normalizer.service.js";
import type { AIProviderPort } from "../../../ai/domain/ports/ai-provider.port.js";
import { prisma } from "../../../../database/prisma.js";
import { urlExtractorRegistry } from "../../../job-import/infrastructure/extractors/url-extractor.registry.js";
import {
  matchEngineService,
  type MatchProfileInput,
} from "../../../match/domain/services/match-engine.service.js";
import { MATCH_ENGINE_VERSION } from "../../../../shared/domain/match-weights.js";
import { AppError } from "../../../../shared/errors/app-error.js";
import type { ResumeAnalysisSnapshot, ResumeJobAnalysisResult } from "../../domain/entities/resume-analysis.entity.js";
import type { ResumeStructuredContent } from "../../domain/entities/resume.entity.js";
import type { ResumeRepository } from "../../domain/repositories/resume.repository.js";
import { computeResumeAnalysisHash } from "../../domain/services/compute-resume-hash.service.js";
import { prismaResumeRepository } from "../../infrastructure/repositories/prisma-resume.repository.js";
import {
  compressResumeAnalysisSnapshot,
  RESUME_PROMPT_VERSION,
} from "../../infrastructure/prompts/resume.prompt-builder.js";
import { parseResumeJobAnalysisResponse } from "../../infrastructure/prompts/resume.response-parser.js";

const extractTechnologies = (description: string): string[] => {
  const matches = description.match(/\b[A-Z][a-zA-Z+#.]{1,24}\b/g) ?? [];
  return [...new Set(matches)].slice(0, 15);
};

export class ResumeAnalysisService {
  constructor(
    private readonly repository: ResumeRepository = prismaResumeRepository,
    private readonly aiProvider: AIProviderPort = geminiProvider,
    private readonly skillNormalizer = new SkillNormalizer(prismaSkillCatalogRepository),
  ) {}

  async buildSnapshot(
    userId: string,
    resumeContent: ResumeStructuredContent,
    resumeVersionId: string,
    resumeVersionNumber: number,
    jobUrl: string,
  ): Promise<ResumeAnalysisSnapshot> {
    const extracted = await urlExtractorRegistry.extract(jobUrl);
    const job = extracted.job;

    const profile = await prisma.profile.findUnique({ where: { userId } });
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    const resumeSkillNames = [
      ...resumeContent.hardSkills,
      ...resumeContent.experiences.flatMap((e) => e.technologies),
    ];
    const profileSkillNames = userSkills.map((s: { skill: { name: string } }) => s.skill.name);
    const combinedSkills = [...new Set([...profileSkillNames, ...profileSkillNames, ...resumeSkillNames])];

    const technologies = extractTechnologies(job.description).map((name) => ({
      name,
      slug: name.toLowerCase(),
    }));

    const matchProfile: MatchProfileInput = {
      area: profile?.area,
      seniority: profile?.seniority,
      modality: profile?.modality,
      location: profile?.location,
      skillNames: combinedSkills,
    };

    const match = matchEngineService.compute(matchProfile, {
      title: job.title,
      area: null,
      seniority: job.seniority,
      modality: job.modality,
      location: job.location,
      technologies,
      requirements: [],
    });

    const skillCompare = await this.skillNormalizer.compare(
      combinedSkills,
      technologies.map((t) => t.name),
    );

    return {
      resume: resumeContent,
      resumeVersionId,
      resumeVersionNumber,
      profile: {
        area: profile?.area,
        seniority: profile?.seniority,
        modality: profile?.modality,
        location: profile?.location,
        skillNames: profile?.skillNames ?? [],
      },
      job: {
        title: job.title,
        company: job.company,
        description: job.description,
        sourceUrl: job.sourceUrl,
        externalId: job.externalId,
        technologies: technologies.map((t) => t.name),
        requirements: [],
      },
      match: {
        ...match,
        matchedSkills: skillCompare.matched,
        missingSkills: skillCompare.missing.map((slug) => ({ id: slug, name: slug, slug })),
      },
      meta: {
        promptVersion: RESUME_PROMPT_VERSION,
        matchEngineVersion: MATCH_ENGINE_VERSION,
        model: resolveGeminiModel(),
      },
    };
  }

  async analyze(
    userId: string,
    resumeContent: ResumeStructuredContent,
    resumeVersionId: string,
    resumeVersionNumber: number,
    resumeId: string,
    jobUrl: string,
  ): Promise<{ analysis: ResumeJobAnalysisResult; analysisId: string; cached: boolean }> {
    const snapshot = await this.buildSnapshot(
      userId,
      resumeContent,
      resumeVersionId,
      resumeVersionNumber,
      jobUrl,
    );
    const contentHash = computeResumeAnalysisHash(snapshot);

    const cached = await this.repository.findAnalysisByHash(userId, contentHash);
    if (cached) {
      await this.repository.logUsage({
        userId,
        analysisId: cached.id,
        wasCached: true,
        model: cached.model,
      });
      return { analysis: cached.result, analysisId: cached.id, cached: true };
    }

    if (!env.GEMINI_API_KEY?.trim()) {
      throw new AppError("AI provider is not configured", 503, "AI_NOT_CONFIGURED");
    }

    const started = Date.now();
    const compressed = compressResumeAnalysisSnapshot(snapshot);
    const aiResult = await this.aiProvider.analyzeResumeForJob({
      snapshot: compressed,
      model: resolveGeminiModel(),
    });

    const matchedCount = snapshot.match.matchedSkills.length;
    const missingCount = snapshot.match.missingSkills.length;

    const result = parseResumeJobAnalysisResponse(
      aiResult.rawJson,
      snapshot.match.score,
      matchedCount,
      missingCount,
    );

    const saved = await this.repository.saveAnalysis({
      userId,
      resumeId,
      resumeVersionId,
      jobSourceUrl: snapshot.job.sourceUrl,
      jobExternalId: snapshot.job.externalId,
      jobTitle: snapshot.job.title,
      jobCompany: snapshot.job.company,
      contentHash,
      result,
      matchScore: result.matchScore,
      atsScore: result.atsScore,
      provider: this.aiProvider.providerName,
      model: resolveGeminiModel(),
      promptVersion: RESUME_PROMPT_VERSION,
      matchEngineVersion: MATCH_ENGINE_VERSION,
    });

    await this.repository.saveSuggestions(saved.id, result.suggestions);

    await this.repository.logUsage({
      userId,
      analysisId: saved.id,
      wasCached: false,
      durationMs: Date.now() - started,
      model: resolveGeminiModel(),
      promptTokens: aiResult.promptTokens,
      completionTokens: aiResult.completionTokens,
    });

    return { analysis: result, analysisId: saved.id, cached: false };
  }
}

export const resumeAnalysisService = new ResumeAnalysisService();
