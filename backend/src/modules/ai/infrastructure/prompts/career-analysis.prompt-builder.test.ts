import { describe, expect, it } from "vitest";

import type { AnalysisSnapshot } from "../../domain/entities/career-analysis.entity.js";
import { buildCareerAnalysisPrompt, compressAnalysisSnapshot } from "./career-analysis.prompt-builder.js";

const snapshot = (): AnalysisSnapshot => ({
  job: {
    id: "job-1",
    title: "Dev",
    companyName: "Co",
    description: "x".repeat(3000),
    technologySlugs: ["react"],
    requirementSlugs: Array.from({ length: 15 }, (_, i) => `req-${i}`),
  },
  profile: {
    location: "SP",
    userSkills: [],
  },
  tracking: { stage: "applied", priority: "MEDIUM" },
  timeline: Array.from({ length: 8 }, (_, i) => ({
    type: "note",
    title: `Event ${i}`,
    occurredAt: new Date().toISOString(),
  })),
  match: {
    score: 70,
    matchedSkills: ["react"],
    missingSkills: [],
    engineVersion: "rules-v1",
  },
  meta: {
    promptVersion: "career-v1",
    matchEngineVersion: "rules-v1",
    model: "gemini-2.5-flash",
  },
});

describe("career-analysis prompt builder", () => {
  it("compresses description and limits lists", () => {
    const compressed = compressAnalysisSnapshot(snapshot());
    expect(compressed.job.description.length).toBeLessThanOrEqual(2000);
    expect(compressed.job.requirementSlugs.length).toBeLessThanOrEqual(10);
    expect(compressed.timeline.length).toBeLessThanOrEqual(5);
  });

  it("builds prompt with match score", () => {
    const prompt = buildCareerAnalysisPrompt(snapshot());
    expect(prompt).toContain("70%");
    expect(prompt).toContain("rules-v1");
  });
});
