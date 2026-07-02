import type { NextFunction, Request, Response } from "express";

import { getAuthUserId } from "../../../../../shared/http/get-auth-user-id.js";
import type { GetDashboardUseCase } from "../../../application/use-cases/get-dashboard.use-case.js";

export class DashboardController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const response = await this.getDashboardUseCase.execute(userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
