import type { NextFunction, Request, Response } from "express";

import { ValidationError } from "../../../../../shared/errors/validation-error.js";
import type { CreateProfileUseCase } from "../../../application/use-cases/create-profile.use-case.js";
import type { GetProfileUseCase } from "../../../application/use-cases/get-profile.use-case.js";
import type { UpdateProfileUseCase } from "../../../application/use-cases/update-profile.use-case.js";
import { createProfileSchema, updateProfileSchema } from "../schemas/update-profile.schema.js";

export class ProfileController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly createProfileUseCase: CreateProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        throw new ValidationError("User not authenticated");
      }

      const response = await this.getProfileUseCase.execute(userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  createProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createProfileSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const userId = req.auth?.userId;

      if (!userId) {
        throw new ValidationError("User not authenticated");
      }

      const response = await this.createProfileUseCase.execute({
        userId,
        input: parsed.data,
      });
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const userId = req.auth?.userId;

      if (!userId) {
        throw new ValidationError("User not authenticated");
      }

      const response = await this.updateProfileUseCase.execute({
        userId,
        input: parsed.data,
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
