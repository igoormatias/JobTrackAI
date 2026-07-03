import type { Request, Response, NextFunction } from "express";

import { getRouteParam } from "../../../../../shared/http/get-route-param.js";
import { getAuthUserId } from "../../../../../shared/http/get-auth-user-id.js";
import type {
  GenerateCareerAnalysisUseCase,
  GetCareerAnalysisUseCase,
} from "../../../application/use-cases/career-analysis.use-cases.js";

export class AiCareerAnalysisController {
  constructor(
    private readonly getUseCase: GetCareerAnalysisUseCase,
    private readonly generateUseCase: GenerateCareerAnalysisUseCase,
  ) {}

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const trackingId = getRouteParam(req, "trackingId");
      const userId = getAuthUserId(req);
      const data = await this.getUseCase.execute(userId, trackingId);

      if (!data) {
        res.status(204).send();
        return;
      }

      res.json({ data });
    } catch (error) {
      next(error);
    }
  };

  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const trackingId = getRouteParam(req, "trackingId");
      const userId = getAuthUserId(req);
      const refresh = req.query.refresh === "true";
      const data = await this.generateUseCase.execute(userId, trackingId, refresh);
      res.status(refresh ? 200 : 201).json({ data });
    } catch (error) {
      next(error);
    }
  };
}
