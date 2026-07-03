import { env } from "../../../../config/env.js";
import { geminiProvider, resolveGeminiModel } from "../../../ai/infrastructure/providers/gemini.provider.js";
import { prismaSkillCatalogRepository } from "../../../ai/infrastructure/repositories/prisma-skill-catalog.repository.js";
import { SkillNormalizer } from "../../../ai/domain/services/skill-normalizer.service.js";
import type { AIProviderPort } from "../../../ai/domain/ports/ai-provider.port.js";
import type { ResumeStructuredContent } from "../../domain/entities/resume.entity.js";
import {
  fallbackStructureFromText,
  parseResumeStructureResponse,
} from "../../infrastructure/prompts/resume.response-parser.js";

export class ResumeStructureService {
  constructor(
    private readonly aiProvider: AIProviderPort = geminiProvider,
    private readonly skillNormalizer = new SkillNormalizer(prismaSkillCatalogRepository),
  ) {}

  async structureFromText(rawText: string): Promise<ResumeStructuredContent> {
    const trimmed = rawText.trim();
    if (!trimmed) {
      return fallbackStructureFromText("");
    }

    if (!env.GEMINI_API_KEY?.trim()) {
      return fallbackStructureFromText(trimmed);
    }

    try {
      const result = await this.aiProvider.analyzeResumeStructure({
        rawText: trimmed,
        model: resolveGeminiModel(),
      });
      const structured = parseResumeStructureResponse(result.rawJson);
      return this.normalizeSkills(structured);
    } catch {
      return fallbackStructureFromText(trimmed);
    }
  }

  async normalizeSkills(content: ResumeStructuredContent): Promise<ResumeStructuredContent> {
    const hardSkills = [
      ...new Set(
        await Promise.all(content.hardSkills.map((skill) => this.skillNormalizer.resolveSlug(skill))),
      ),
    ];
    const softSkills = [
      ...new Set(
        await Promise.all(content.softSkills.map((skill) => this.skillNormalizer.resolveSlug(skill))),
      ),
    ];

    const experiences = await Promise.all(
      content.experiences.map(async (exp) => ({
        ...exp,
        technologies: [
          ...new Set(
            await Promise.all(exp.technologies.map((tech) => this.skillNormalizer.resolveSlug(tech))),
          ),
        ],
      })),
    );

    return { ...content, hardSkills, softSkills, experiences };
  }
}

export const resumeStructureService = new ResumeStructureService();
