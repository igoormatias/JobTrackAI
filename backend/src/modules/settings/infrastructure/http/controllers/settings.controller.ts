import type { NextFunction, Request, Response } from "express";

import { ValidationError } from "../../../../../shared/errors/validation-error.js";
import type { GetSettingsUseCase } from "../../../application/use-cases/get-settings.use-case.js";
import type { UpdateSettingsUseCase } from "../../../application/use-cases/update-settings.use-case.js";
import { updateSettingsSchema } from "../schemas/update-settings.schema.js";

export class SettingsController {
  constructor(
    private readonly getSettingsUseCase: GetSettingsUseCase,
    private readonly updateSettingsUseCase: UpdateSettingsUseCase,
  ) {}

  getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        throw new ValidationError("User not authenticated");
      }

      const response = await this.getSettingsUseCase.execute(userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateSettingsSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const userId = req.auth?.userId;

      if (!userId) {
        throw new ValidationError("User not authenticated");
      }

      const response = await this.updateSettingsUseCase.execute({
        userId,
        data: parsed.data,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
