import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import type { ResumeRepository } from "../../domain/repositories/resume.repository.js";
import { buildContentHash } from "../../domain/services/resume-content.service.js";
import { prismaResumeRepository } from "../../infrastructure/repositories/prisma-resume.repository.js";
import { resumeStructureService } from "../services/resume-structure.service.js";

export class GetResumeUseCase {
  constructor(private readonly repository: ResumeRepository = prismaResumeRepository) {}

  async execute(userId: string) {
    const resume = await this.repository.ensureForUser(userId);
    return { data: resume };
  }
}

export class UpdateResumeUseCase {
  constructor(
    private readonly repository: ResumeRepository = prismaResumeRepository,
    private readonly structureService = resumeStructureService,
  ) {}

  async execute(
    userId: string,
    content: Parameters<typeof buildContentHash>[0],
    source: "manual" | "paste" | "upload" | "import_ai" | "suggestion" = "manual",
  ) {
    const resume = await this.repository.ensureForUser(userId);
    const normalized = await this.structureService.normalizeSkills(content);
    const contentHash = buildContentHash(normalized);
    const version = await this.repository.createVersion({
      resumeId: resume.id,
      content: normalized,
      contentHash,
      source,
    });
    const updated = await this.repository.setCurrentVersion(resume.id, version.id);
    return { data: updated, message: "Currículo atualizado" };
  }
}

export class ListResumeVersionsUseCase {
  constructor(private readonly repository: ResumeRepository = prismaResumeRepository) {}

  async execute(userId: string) {
    const resume = await this.repository.ensureForUser(userId);
    const versions = await this.repository.listVersions(resume.id);
    return { data: versions };
  }
}

export class RestoreResumeVersionUseCase {
  constructor(private readonly updateResume = new UpdateResumeUseCase()) {}

  async execute(userId: string, versionId: string) {
    const repo = prismaResumeRepository;
    const version = await repo.findVersionById(versionId, userId);
    if (!version) {
      throw new NotFoundError("Versão não encontrada");
    }
    return this.updateResume.execute(userId, version.content, "manual");
  }
}

export class ListResumeHistoryUseCase {
  constructor(private readonly repository: ResumeRepository = prismaResumeRepository) {}

  async execute(userId: string, limit = 20) {
    const history = await this.repository.listHistory(userId, limit);
    return { data: history };
  }
}
