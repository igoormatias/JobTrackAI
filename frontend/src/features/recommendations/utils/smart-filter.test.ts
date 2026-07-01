import { describe, expect, it } from "vitest";

import type { Job } from "@/types/job";
import type { RecommendationProfile } from "../types/recommendation.types";
import { enrichJobsWithMatch, prioritizeJobsForProfile } from "./smart-filter";

const profile: RecommendationProfile = {
  area: "frontend",
  seniority: "senior",
  modality: "remote",
  location: "Brasil",
  locationPreference: { scope: "country", acceptsRelocation: false },
  salaryBand: "8k_12k",
  salaryExpectation: { min: 8000, max: 12000, currency: "BRL" },
  skillNames: ["React"],
  blockedSkills: [],
};

const baseJob = (area: Job["area"], tech: string, id: string): Job =>
  ({
    id,
    title: `${area} job`,
    slug: id,
    companyId: "c1",
    company: { id: "c1", name: "Test", slug: "test", logoUrl: null },
    area,
    seniority: "senior",
    modality: "remote",
    location: "SP",
    salaryMin: 8000,
    salaryMax: 12000,
    currency: "BRL",
    description: "",
    requirements: [tech],
    benefits: [],
    technologies: [{ id: "t1", name: tech, slug: tech.toLowerCase() }],
    source: "gupy",
    sourceUrl: "url",
    status: "active",
    isFavorite: false,
    engagementState: "new",
    matchScore: { score: 0, label: "low", reasons: [], missingSkills: [] },
    publishedAt: "2025-01-01T00:00:00.000Z",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  }) as Job;

describe("smart-filter", () => {
  it("prioritizes jobs from the same area", () => {
    const jobs = [
      baseJob("data_engineer", "Spark", "job_1"),
      baseJob("frontend", "React", "job_2"),
    ];

    const prioritized = prioritizeJobsForProfile(jobs, profile);

    expect(prioritized[0]?.area).toBe("frontend");
  });

  it("enriches jobs with computed match scores", () => {
    const jobs = [baseJob("frontend", "React", "job_1")];
    const enriched = enrichJobsWithMatch(jobs, profile);

    expect(enriched[0]?.matchScore.score).toBeGreaterThan(0);
  });
});
