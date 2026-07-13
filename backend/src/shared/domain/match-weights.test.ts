import { describe, expect, it } from "vitest";

import {
  DASHBOARD_TOP_MATCH_THRESHOLD,
  MATCH_ENGINE_VERSION,
  MATCH_WEIGHTS,
} from "./match-weights.js";

describe("match-weights", () => {
  it("exposes rules-v5 as canonical engine", () => {
    expect(MATCH_ENGINE_VERSION).toBe("rules-v5");
  });

  it("uses dashboard threshold of 70", () => {
    expect(DASHBOARD_TOP_MATCH_THRESHOLD).toBe(70);
  });

  it("keeps technical group as the largest weight", () => {
    expect(MATCH_WEIGHTS.groups.technical).toBe(60);
    expect(MATCH_WEIGHTS.groups.jobFit).toBe(25);
    expect(MATCH_WEIGHTS.technical.skills).toBeGreaterThan(MATCH_WEIGHTS.technical.seniority);
  });
});
