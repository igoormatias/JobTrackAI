import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { applySuggestionToContent } from "../../domain/services/resume-content.service.js";
import { prismaResumeRepository } from "../../infrastructure/repositories/prisma-resume.repository.js";
import { resumeAnalysisService } from "../services/resume-analysis.service.js";
import { UpdateResumeUseCase } from "./resume-crud.use-cases.js";

export class AnalyzeResumeJobUseCase {
  constructor(
    private readonly repository = prismaResumeRepository,
    private readonly analysisService = resumeAnalysisService,
  ) {}

  async execute(userId: string, url: string) {
    const resume = await this.repository.ensureForUser(userId);
    const version = resume.currentVersion;
    if (!version) {
      throw new ValidationError("Cadastre ou importe um currículo antes de analisar uma vaga.");
    }

    const { analysis, analysisId, cached } = await this.analysisService.analyze(
      userId,
      version.content,
      version.id,
      version.versionNumber,
      resume.id,
      url,
    );

    const suggestions = await this.repository.listSuggestions(analysisId);

    return {
      data: {
        analysisId,
        analysis,
        suggestions,
        resumeVersionId: version.id,
        cached,
      },
    };
  }
}

export class GetResumeAnalysisUseCase {
  constructor(private readonly repository = prismaResumeRepository) {}

  async execute(userId: string, analysisId: string) {
    const analysis = await this.repository.findAnalysisById(analysisId, userId);
    if (!analysis) throw new NotFoundError("Análise não encontrada");

    const suggestions = await this.repository.listSuggestions(analysisId);
    return { data: { ...analysis, suggestions } };
  }
}

export class ApplyResumeSuggestionUseCase {
  constructor(
    private readonly repository = prismaResumeRepository,
    private readonly updateResume = new UpdateResumeUseCase(),
  ) {}

  async execute(userId: string, suggestionId: string, editedText?: string) {
    const suggestion = await this.repository.findSuggestionById(suggestionId, userId);
    if (!suggestion) throw new NotFoundError("Sugestão não encontrada");
    if (suggestion.status !== "pending") {
      throw new ValidationError("Sugestão já foi processada.");
    }

    const resume = await this.repository.ensureForUser(userId);
    const current = resume.currentVersion;
    if (!current) throw new ValidationError("Currículo não encontrado.");

    const textToApply = editedText?.trim() || suggestion.suggestedText;
    const updatedContent = applySuggestionToContent(current.content, suggestion.section, textToApply);
    const status = editedText ? "edited" : "accepted";

    const result = await this.updateResume.execute(userId, updatedContent, "suggestion");
    const versionId = result.data.currentVersion?.id ?? null;

    await this.repository.updateSuggestionStatus(suggestionId, status, versionId);

    return {
      data: {
        resume: result.data,
        suggestion: await this.repository.findSuggestionById(suggestionId, userId),
      },
      message: "Sugestão aplicada",
    };
  }
}

export class RejectResumeSuggestionUseCase {
  constructor(private readonly repository = prismaResumeRepository) {}

  async execute(userId: string, suggestionId: string) {
    const suggestion = await this.repository.findSuggestionById(suggestionId, userId);
    if (!suggestion) throw new NotFoundError("Sugestão não encontrada");

    await this.repository.updateSuggestionStatus(suggestionId, "rejected");
    return { message: "Sugestão rejeitada" };
  }
}
