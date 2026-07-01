import type { NextFunction, Request, Response } from "express";

import type { RecommendationResponseDto } from "../dto/recommendation.dto.js";
import { recommendationService, type RecommendationService } from "../services/recommendation.service.js";

export class RecommendationController {
  constructor(private readonly service: RecommendationService = recommendationService) {}

  list = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      try {
        const data = this.service.getRecommendations(userId);
        const response: RecommendationResponseDto = { data };
        res.status(200).json(response);
      } catch {
        const response: RecommendationResponseDto = {
          data: {
            items: [],
            generatedAt: new Date().toISOString(),
          },
          message: "Recommendation engine not implemented yet",
        };
        res.status(200).json(response);
      }
    } catch (error) {
      next(error);
    }
  };
}
