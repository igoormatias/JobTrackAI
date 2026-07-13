import { describe, expect, it } from "vitest";

import { DASHBOARD_TOP_MATCH_THRESHOLD, MATCH_ENGINE_VERSION, MATCH_WEIGHTS } from "./match-weights.js";

describe("match-weights", () => {
  it("exposes rules-v4 as canonical engine", () => {
    expect(MATCH_ENGINE_VERSION).toBe("rules-v4");
  });

  it("uses dashboard threshold of 70", () => {
    expect(DASHBOARD_TOP_MATCH_THRESHOLD).toBe(70);
  });

  it("sums core weights to 100 and prioritizes skills", () => {
    const total =
      MATCH_WEIGHTS.skills +
      MATCH_WEIGHTS.seniority +
      MATCH_WEIGHTS.modality +
      MATCH_WEIGHTS.location +
      MATCH_WEIGHTS.salary +
      MATCH_WEIGHTS.area;
    expect(total).toBe(100);
    expect(MATCH_WEIGHTS.skills).toBeGreaterThan(MATCH_WEIGHTS.seniority);
    expect(MATCH_WEIGHTS.skills).toBeGreaterThan(MATCH_WEIGHTS.area);
  });
});
