import { createHash } from "node:crypto";

import { ValidationError } from "../../../../shared/errors/validation-error.js";
import type { ResumeRepository } from "../../domain/repositories/resume.repository.js";
import {
  detectFormat,
  extractTextFromFile,
} from "../../infrastructure/parsers/resume-file.parser.js";
import { prismaResumeRepository } from "../../infrastructure/repositories/prisma-resume.repository.js";
import { resumeStructureService } from "../services/resume-structure.service.js";
import { UpdateResumeUseCase } from "./resume-crud.use-cases.js";

export class UploadResumeUseCase {
  constructor(
    private readonly repository: ResumeRepository = prismaResumeRepository,
    private readonly structureService = resumeStructureService,
    private readonly updateResume = new UpdateResumeUseCase(),
  ) {}

  async execute(userId: string, file: Express.Multer.File) {
    const format = detectFormat(file.mimetype, file.originalname);
    if (!format) {
      throw new ValidationError("Formato não suportado. Use PDF, DOCX ou TXT.");
    }

    const fileHash = createHash("sha256").update(file.buffer).digest("hex");

    try {
      const rawText = await extractTextFromFile(file.buffer, format);
      if (!rawText.trim()) {
        throw new ValidationError("Não foi possível extrair texto do arquivo.");
      }

      const structured = await this.structureService.structureFromText(rawText);
      const result = await this.updateResume.execute(userId, structured, "upload");

      await this.repository.logImport({
        userId,
        format,
        status: "success",
        rawTextLength: rawText.length,
        fileHash,
        versionId: result.data.currentVersion?.id ?? null,
      });

      return { ...result, warnings: [] as string[] };
    } catch (error) {
      await this.repository.logImport({
        userId,
        format,
        status: "failed",
        rawTextLength: file.buffer.length,
        fileHash,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

export class ImportResumeTextUseCase {
  constructor(
    private readonly repository: ResumeRepository = prismaResumeRepository,
    private readonly structureService = resumeStructureService,
    private readonly updateResume = new UpdateResumeUseCase(),
  ) {}

  async execute(userId: string, text: string) {
    const structured = await this.structureService.structureFromText(text);
    const result = await this.updateResume.execute(userId, structured, "paste");

    await this.repository.logImport({
      userId,
      format: "paste",
      status: "success",
      rawTextLength: text.length,
      versionId: result.data.currentVersion?.id ?? null,
    });

    return result;
  }
}
