import type { NextFunction, Request, Response } from "express";

import { getAuthUserId } from "../../../../../shared/http/get-auth-user-id.js";
import { ValidationError } from "../../../../../shared/errors/validation-error.js";
import type { ConfirmJobImportUseCase } from "../../../application/use-cases/confirm-job-import.use-case.js";
import type { PreviewJobFromUrlUseCase } from "../../../application/use-cases/preview-job-from-url.use-case.js";
import { confirmJobImportSchema, previewJobImportSchema } from "../schemas/job-import.schema.js";

export class JobImportController {
  constructor(
    private readonly previewJobFromUrlUseCase: PreviewJobFromUrlUseCase,
    private readonly confirmJobImportUseCase: ConfirmJobImportUseCase,
  ) {}

  preview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = previewJobImportSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const response = await this.previewJobFromUrlUseCase.execute(parsed.data);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  confirm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = confirmJobImportSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const response = await this.confirmJobImportUseCase.execute({
        userId: getAuthUserId(req),
        ...parsed.data,
      });
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
}
