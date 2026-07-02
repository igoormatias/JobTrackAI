import type { NextFunction, Request, Response } from "express";

import { ValidationError } from "../../../shared/errors/validation-error.js";
import { loginSchema, onboardingCompleteSchema } from "../schemas/auth.schemas.js";
import { ACCESS_COOKIE, authService, REFRESH_COOKIE, type AuthService } from "../services/auth.service.js";

export class AuthController {
  private readonly service: AuthService;

  constructor(service: AuthService = authService) {
    this.service = service;
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = loginSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const response = await this.service.loginWithGoogle(parsed.data.idToken, res);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  logout = (_req: Request, res: Response): void => {
    const result = this.service.logout(res);
    res.status(200).json({ data: null, message: result.message });
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
      const response = await this.service.refreshSession(refreshToken, res);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessToken = req.cookies?.[ACCESS_COOKIE] as string | undefined;
      const response = await this.service.getCurrentUser(accessToken);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  completeOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = onboardingCompleteSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const accessToken = req.cookies?.[ACCESS_COOKIE] as string | undefined;
      const currentUser = await this.service.getCurrentUser(accessToken);
      const response = await this.service.completeOnboarding(currentUser.data.user.id, parsed.data);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
};
