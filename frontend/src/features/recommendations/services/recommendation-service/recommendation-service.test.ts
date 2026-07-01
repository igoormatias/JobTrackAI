import { describe, expect, it } from "vitest";

import { getFixtureStore } from "@/mocks/fixtures";
import { createRecommendationEngine } from "./recommendation-service";
import type { RecommendationProfile } from "../../types/recommendation.types";

const frontendProfile: RecommendationProfile = {
  area: "frontend",
  seniority: "senior",
  modality: "remote",
  location: "Brasil",
  locationPreference: { scope: "country", acceptsRelocation: false },
  salaryBand: "8k_12k",
  salaryExpectation: { min: 8000, max: 12000, currency: "BRL" },
  skillNames: ["React", "TypeScript"],
  blockedSkills: [],
};

describe("recommendation-service", () => {
  it("scores jobs using profile context", () => {
    const store = getFixtureStore();
    const engine = createRecommendationEngine({
      getUserProfile: () => null,
      getAuthUserId: () => "user_0001",
      getAuthProfile: () => null,
      getFixtureProfile: () => store.profile,
    });

    const scored = engine.getScoredJobs(store.jobs.slice(0, 20), frontendProfile);

    expect(scored[0]?.matchScore.score).toBeGreaterThan(0);
    expect(scored[0]?.matchScore.reasons.length).toBeGreaterThan(0);
  });
});
