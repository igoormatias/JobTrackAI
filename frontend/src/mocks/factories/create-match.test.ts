import { describe, expect, it } from "vitest";

import { createMatchScore } from "./create-match";

describe("createMatchScore", () => {
  it("creates a match score with reasons and missing skills", () => {
    const match = createMatchScore({ score: 94 });

    expect(match.score).toBe(94);
    expect(match.label).toBe("excellent");
    expect(match.reasons.length).toBeGreaterThan(0);
    expect(match.missingSkills.length).toBeGreaterThan(0);
    expect(match.reasons.every((reason) => reason.matched)).toBe(true);
  });
});
