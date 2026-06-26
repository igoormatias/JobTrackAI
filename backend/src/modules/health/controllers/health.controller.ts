import type { Request, Response } from "express";

import { HealthService } from "../services/health.service.js";

export class HealthController {
  private readonly healthService: HealthService;

  constructor(healthService = new HealthService()) {
    this.healthService = healthService;
  }

  getHealth = (_req: Request, res: Response): void => {
    const health = this.healthService.getHealth(process.env.npm_package_version ?? "0.1.0");
    res.status(200).json(health);
  };
}
