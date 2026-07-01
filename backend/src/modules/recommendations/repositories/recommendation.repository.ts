import type { RecommendationList } from "../types/recommendation.types.js";

export class RecommendationRepository {
  findByUserId(_userId: string): RecommendationList {
    return {
      items: [],
      generatedAt: new Date().toISOString(),
    };
  }
}

export const recommendationRepository = new RecommendationRepository();
