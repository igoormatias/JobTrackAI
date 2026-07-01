import type { RecommendationList } from "../types/recommendation.types.js";

export type RecommendationResponseDto = {
  data: RecommendationList;
  message?: string;
};

export type { RecommendationList, RecommendationItem } from "../types/recommendation.types.js";
