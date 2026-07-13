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
    userSkills: [{ skillSlug: "react", skillName: "React" }],
  },
  tracking: { stage: "applied", priority: "MEDIUM" },
  timeline: Array.from({ length: 8 }, (_, i) => ({
    type: "note",
    title: `Event ${i}`,
    occurredAt: new Date().toISOString(),
  })),
  match: {
    score: 70,
    matchedSkills: ["React"],
    missingSkills: ["Docker"],
    engineVersion: "rules-v4",
    skillCoverage: { matched: 1, required: 2, percent: 50 },
    factors: [
      {
        id: "factor_skills",
        label: "Skills",
        weight: 50,
        applicable: true,
        matched: true,
        detail: "1 de 2 skills encontradas (50%)",
      },
    ],
    skillEvidence: [
      { name: "React", slug: "react", present: true },
      { name: "Docker", slug: "docker", present: false },
    ],
  },
  meta: {
    promptVersion: "career-v2",
    matchEngineVersion: "rules-v4",
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

  it("builds evidence-based prompt without proficiency levels", () => {
    const prompt = buildCareerAnalysisPrompt(snapshot());
    expect(prompt).toContain("70%");
    expect(prompt).toContain("rules-v4");
    expect(prompt).toContain("Nunca invente nível de conhecimento");
    expect(prompt).toContain("Cobertura de skills: 1 de 2 (50%)");
    expect(prompt).toContain("✔ React");
    expect(prompt).toContain("✖ Docker");
    expect(prompt).not.toMatch(/\(INTERMEDIATE\)|\(ADVANCED\)|\(BEGINNER\)|\(EXPERT\)/);
    expect(prompt).not.toContain('"missingSkills"');
  });
});
