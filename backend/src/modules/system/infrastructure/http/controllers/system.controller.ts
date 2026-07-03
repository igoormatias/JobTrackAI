import type { NextFunction, Request, Response } from "express";

import type { GetHealthUseCase } from "../../../application/use-cases/get-health.use-case.js";
import type { GetInfoUseCase } from "../../../application/use-cases/get-info.use-case.js";
import type { GetVersionUseCase } from "../../../application/use-cases/get-version.use-case.js";

export class SystemController {
  constructor(
    private readonly getHealthUseCase: GetHealthUseCase,
    private readonly getVersionUseCase: GetVersionUseCase,
    private readonly getInfoUseCase: GetInfoUseCase,
  ) {}

  getHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await this.getHealthUseCase.execute();
      const statusCode = health.status === "error" ? 503 : 200;
      res.status(statusCode).json(health);
    } catch (error) {
      next(error);
    }
  };

  getVersion = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const version = await this.getVersionUseCase.execute();
      res.status(200).json(version);
    } catch (error) {
      next(error);
    }
  };

  getInfo = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const info = await this.getInfoUseCase.execute();
      res.status(200).json(info);
    } catch (error) {
      next(error);
    }
  };
}
