import { describe, expect, it } from "vitest";

import { DASHBOARD_TOP_MATCH_THRESHOLD, MATCH_ENGINE_VERSION, MATCH_WEIGHTS } from "./match-weights.js";

describe("match-weights", () => {
  it("exposes rules-v3 as canonical engine", () => {
    expect(MATCH_ENGINE_VERSION).toBe("rules-v3");
  });

  it("uses dashboard threshold of 60", () => {
    expect(DASHBOARD_TOP_MATCH_THRESHOLD).toBe(60);
  });

  it("gives skills the highest weight", () => {
    expect(MATCH_WEIGHTS.skillsMax).toBeGreaterThan(MATCH_WEIGHTS.titleRoleMax);
    expect(MATCH_WEIGHTS.skillsMax).toBeGreaterThan(MATCH_WEIGHTS.areaMax);
  });
});
