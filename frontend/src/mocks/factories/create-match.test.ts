import { describe, expect, it } from "vitest";

import { createMatchScore } from "./create-match";

describe("createMatchScore", () => {
  it("returns explicit score with empty reasons when score override is provided", () => {
    const match = createMatchScore({ score: 94 });

    expect(match.score).toBe(94);
    expect(match.label).toBe("excellent");
    expect(match.reasons).toEqual([]);
    expect(match.missingSkills).toEqual([]);
  });

  it("returns fallback score with reasons and missing skills when no inputs", () => {
    const match = createMatchScore();

    expect(match.score).toBe(70);
    expect(match.reasons.length).toBeGreaterThan(0);
    expect(match.missingSkills.length).toBeGreaterThan(0);
    expect(match.reasons.every((reason) => reason.matched)).toBe(true);
  });
});
