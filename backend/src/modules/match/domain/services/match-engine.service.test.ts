import { describe, expect, it } from "vitest";

import type { MatchJobInput, MatchProfileInput } from "./match-engine.service.js";
import { MatchEngineService } from "./match-engine.service.js";

const baseProfile: MatchProfileInput = {
  area: "frontend",
  seniority: "senior",
  modality: "remote",
  location: "São Paulo",
  skillNames: ["React", "TypeScript", "Next.js"],
  blockedSkills: [],
};

const baseJob: MatchJobInput = {
  area: "frontend",
  seniority: "senior",
  modality: "remote",
  location: "São Paulo, SP",
  salaryMin: 10000,
  salaryMax: 15000,
  technologies: [
    { name: "React", slug: "react" },
    { name: "TypeScript", slug: "typescript" },
    { name: "Docker", slug: "docker" },
  ],
  requirements: ["React", "TypeScript"],
};

describe("MatchEngineService", () => {
  const engine = new MatchEngineService();

  it("returns rules-v1 engine version", () => {
    const result = engine.compute(baseProfile, baseJob);
    expect(result.engineVersion).toBe("rules-v1");
  });

  it("scores higher when skills match", () => {
    const result = engine.compute(baseProfile, baseJob);
    expect(result.score).toBeGreaterThan(50);
    expect(result.matchedSkills).toContain("React");
    expect(result.matchedSkills).toContain("TypeScript");
  });

  it("includes missing skills from job technologies", () => {
    const result = engine.compute(baseProfile, baseJob);
    expect(result.missingSkills.some((s) => s.name === "Docker")).toBe(true);
  });

  it("penalizes blocked skills present in job", () => {
    const profile = { ...baseProfile, blockedSkills: ["Docker"] };
    const withBlock = engine.compute(profile, baseJob);
    const without = engine.compute(baseProfile, baseJob);
    expect(withBlock.score).toBeLessThan(without.score);
  });
});
