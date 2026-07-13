import { describe, expect, it } from "vitest";

import type { AnalysisSnapshot } from "../entities/career-analysis.entity.js";
import { computeAnalysisHash } from "./compute-analysis-hash.service.js";

const baseSnapshot = (): AnalysisSnapshot => ({
  job: {
    id: "job-1",
    title: "Developer",
    companyName: "Acme",
    description: "Build apps",
    seniority: "senior",
    modality: "remote",
    technologySlugs: ["react"],
    requirementSlugs: ["typescript"],
  },
  profile: {
    area: "frontend",
    seniority: "senior",
    modality: "remote",
    location: "SP",
    salaryBand: "10-15k",
    userSkills: [{ skillSlug: "react", skillName: "React" }],
  },
  tracking: { stage: "applied", notes: null, priority: "MEDIUM" },
  timeline: [],
  match: {
    score: 80,
    matchedSkills: ["react"],
    missingSkills: ["docker"],
    engineVersion: "rules-v5",
    skillCoverage: { matched: 1, required: 2, percent: 50 },
    factors: [],
    skillEvidence: [
      { name: "react", slug: "react", present: true },
      { name: "docker", slug: "docker", present: false },
    ],
  },
  meta: {
    promptVersion: "career-v3",
    matchEngineVersion: "rules-v5",
    model: "gemini-2.5-flash",
  },
});

describe("computeAnalysisHash", () => {
  it("returns stable hash for same snapshot", () => {
    const snapshot = baseSnapshot();
    expect(computeAnalysisHash(snapshot)).toBe(computeAnalysisHash(snapshot));
  });

  it("changes when prompt version changes", () => {
    const a = baseSnapshot();
    const b = { ...baseSnapshot(), meta: { ...baseSnapshot().meta, promptVersion: "career-v4" } };
    expect(computeAnalysisHash(a)).not.toBe(computeAnalysisHash(b));
  });
});
