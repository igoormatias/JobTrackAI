import type { NextFunction, Request, Response } from "express";

import { ValidationError } from "../../../shared/errors/validation-error.js";
import type { ProfileResponseDto } from "../dto/profile.dto.js";
import { createProfileSchema, updateProfileSchema } from "../schemas/profile.schema.js";
import { profileService, type ProfileService } from "../services/profile.service.js";

export class ProfileController {
  constructor(private readonly service: ProfileService = profileService) {}

  getProfile = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        throw new ValidationError("User not authenticated");
      }

      const profile = this.service.getProfile(userId);
      const response: ProfileResponseDto = { data: profile };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  createProfile = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = createProfileSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const userId = req.auth?.userId;

      if (!userId) {
        throw new ValidationError("User not authenticated");
      }

      const profile = this.service.createProfile(userId, parsed.data);
      const response: ProfileResponseDto = {
        data: profile,
        message: "Profile created successfully",
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const userId = req.auth?.userId;

      if (!userId) {
        throw new ValidationError("User not authenticated");
      }

      const profile = this.service.updateProfile(userId, parsed.data);
      const response: ProfileResponseDto = {
        data: profile,
        message: "Profile updated successfully",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
