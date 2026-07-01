import { NotImplementedError } from "../../../shared/errors/not-implemented-error.js";
import { recommendationRepository, type RecommendationRepository } from "../repositories/recommendation.repository.js";
import type { RecommendationList } from "../types/recommendation.types.js";

export class RecommendationService {
  constructor(private readonly recommendations: RecommendationRepository = recommendationRepository) {}

  getRecommendations(userId: string): RecommendationList {
    const data = this.recommendations.findByUserId(userId);

    if (data.items.length === 0) {
      throw new NotImplementedError("Recommendation engine not implemented yet");
    }

    return data;
  }
}

export const recommendationService = new RecommendationService();
