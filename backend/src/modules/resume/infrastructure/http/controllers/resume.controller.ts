import type { NextFunction, Request, Response } from "express";
import multer from "multer";

import { getAuthUserId } from "../../../../../shared/http/get-auth-user-id.js";
import { ValidationError } from "../../../../../shared/errors/validation-error.js";
import { getRouteParam } from "../../../../../shared/http/get-route-param.js";
import {
  AnalyzeResumeJobUseCase,
  ApplyResumeSuggestionUseCase,
  GetResumeAnalysisUseCase,
  RejectResumeSuggestionUseCase,
} from "../../../application/use-cases/resume-analysis.use-cases.js";
import {
  GetResumeUseCase,
  ListResumeHistoryUseCase,
  ListResumeVersionsUseCase,
  RestoreResumeVersionUseCase,
  UpdateResumeUseCase,
} from "../../../application/use-cases/resume-crud.use-cases.js";
import {
  ImportResumeTextUseCase,
  UploadResumeUseCase,
} from "../../../application/use-cases/resume-import.use-cases.js";
import {
  analyzeJobSchema,
  applySuggestionSchema,
  importTextSchema,
  updateResumeSchema,
} from "../schemas/resume.schema.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const resumeUploadMiddleware = upload.single("file");

export class ResumeController {
  constructor(
    private readonly getResume = new GetResumeUseCase(),
    private readonly updateResume = new UpdateResumeUseCase(),
    private readonly uploadResume = new UploadResumeUseCase(),
    private readonly importText = new ImportResumeTextUseCase(),
    private readonly listVersions = new ListResumeVersionsUseCase(),
    private readonly restoreVersionUseCase = new RestoreResumeVersionUseCase(),
    private readonly analyzeJob = new AnalyzeResumeJobUseCase(),
    private readonly listHistory = new ListResumeHistoryUseCase(),
    private readonly getAnalysis = new GetResumeAnalysisUseCase(),
    private readonly applySuggestion = new ApplyResumeSuggestionUseCase(),
    private readonly rejectSuggestion = new RejectResumeSuggestionUseCase(),
  ) {}

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const response = await this.getResume.execute(userId);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateResumeSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const userId = getAuthUserId(req);
      const response = await this.updateResume.execute(userId, parsed.data.content, parsed.data.source);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      if (!req.file) throw new ValidationError("Arquivo é obrigatório.");
      const response = await this.uploadResume.execute(userId, req.file);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  importTextHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = importTextSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const userId = getAuthUserId(req);
      const response = await this.importText.execute(userId, parsed.data.text);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  listVersionsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const response = await this.listVersions.execute(userId);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  restoreVersionHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const versionId = getRouteParam(req, "id");
      const response = await this.restoreVersionUseCase.execute(userId, versionId);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  analyzeJobHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = analyzeJobSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const userId = getAuthUserId(req);
      const response = await this.analyzeJob.execute(userId, parsed.data.url);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  history = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const response = await this.listHistory.execute(userId);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  getAnalysisHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const analysisId = getRouteParam(req, "id");
      const response = await this.getAnalysis.execute(userId, analysisId);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  applySuggestionHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = applySuggestionSchema.safeParse(req.body ?? {});
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const userId = getAuthUserId(req);
      const suggestionId = getRouteParam(req, "id");
      const response = await this.applySuggestion.execute(userId, suggestionId, parsed.data.editedText);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  rejectSuggestionHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const suggestionId = getRouteParam(req, "id");
      const response = await this.rejectSuggestion.execute(userId, suggestionId);
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
