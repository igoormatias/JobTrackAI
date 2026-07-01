import { describe, expect, it } from "vitest";

import { RecommendationService } from "./recommendation.service.js";

describe("RecommendationService", () => {
  it("returns empty recommendations stub response path", () => {
    const service = new RecommendationService();

    expect(() => service.getRecommendations("user_0001")).toThrow(
      "Recommendation engine not implemented yet",
    );
  });
});
