import { describe, expect, it } from "vitest";

import type { Job } from "@/types/job";
import type { RecommendationProfile } from "../types/recommendation.types";
import { computeMatchScore } from "./match-score";

const frontendProfile: RecommendationProfile = {
  area: "frontend",
  seniority: "senior",
  modality: "remote",
  location: "São Paulo, SP",
  locationPreference: { scope: "country", acceptsRelocation: false },
  salaryBand: "8k_12k",
  salaryExpectation: { min: 8000, max: 12000, currency: "BRL" },
  skillNames: ["React", "TypeScript", "Next.js"],
};

const createTestJob = (overrides: Partial<Job> = {}): Job =>
  ({
    id: "job_test",
    title: "Frontend Developer",
    slug: "frontend-developer",
    companyId: "company_1",
    company: { id: "company_1", name: "Nubank", slug: "nubank", logoUrl: null },
    area: "frontend",
    seniority: "senior",
    modality: "remote",
    location: "São Paulo, SP",
    salaryMin: 9000,
    salaryMax: 14000,
    currency: "BRL",
    description: "Test",
    requirements: ["React", "TypeScript"],
    benefits: ["PLR"],
    technologies: [
      { id: "t1", name: "React", slug: "react" },
      { id: "t2", name: "Next.js", slug: "nextjs" },
      { id: "t3", name: "Docker", slug: "docker" },
    ],
    source: "gupy",
    sourceUrl: "https://gupy.com.br",
    status: "active",
    isFavorite: false,
    engagementState: "new",
    matchScore: { score: 0, label: "low", reasons: [], missingSkills: [] },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }) as Job;

describe("computeMatchScore", () => {
  it("adds points for matched skills and compatible modality", () => {
    const score = computeMatchScore(createTestJob(), frontendProfile);

    expect(score.score).toBeGreaterThanOrEqual(75);
    expect(score.reasons.some((reason) => reason.label.includes("React encontrado"))).toBe(true);
    expect(score.reasons.some((reason) => reason.label.includes("Modalidade compatível"))).toBe(true);
  });

  it("applies seniority mismatch penalty", () => {
    const score = computeMatchScore(createTestJob({ seniority: "junior" }), frontendProfile);

    expect(score.reasons.some((reason) => reason.label === "Senioridade incompatível")).toBe(true);
  });

  it("lists missing skills from job technologies", () => {
    const score = computeMatchScore(createTestJob(), frontendProfile);

    expect(score.missingSkills.some((skill) => skill.name === "Docker")).toBe(true);
  });

  it("clamps score between 0 and 100", () => {
    const score = computeMatchScore(createTestJob(), frontendProfile);
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });
});
