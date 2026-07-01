import { describe, expect, it } from "vitest";

import { filterJobs } from "@/mocks/utils/job-filters";
import type { Job } from "@/types";

const baseJob = {
  id: "job_1",
  title: "React Developer",
  slug: "react-dev",
  companyId: "c1",
  company: { id: "c1", name: "Zeta", slug: "zeta", logoUrl: null },
  area: "frontend" as const,
  seniority: "senior" as const,
  modality: "remote" as const,
  location: "São Paulo",
  salaryMin: 10000,
  salaryMax: 15000,
  currency: "BRL" as const,
  description: "",
  requirements: ["React"],
  benefits: [],
  technologies: [{ id: "t1", name: "React", slug: "react" }],
  source: "gupy" as const,
  sourceUrl: "url",
  status: "active" as const,
  isFavorite: false,
  engagementState: "new" as const,
  matchScore: { score: 90, label: "excellent" as const, reasons: [], missingSkills: [] },
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} satisfies Job;

describe("filterJobs", () => {
  it("filters by multi-select areas and sources", () => {
    const jobs: Job[] = [
      baseJob,
      {
        ...baseJob,
        id: "job_2",
        area: "backend",
        source: "linkedin",
        company: { ...baseJob.company, name: "Alpha" },
      },
    ];

    const filtered = filterJobs(jobs, {
      areas: ["frontend"],
      sources: ["gupy"],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("job_1");
  });

  it("sorts by company name", () => {
    const jobs: Job[] = [
      baseJob,
      { ...baseJob, id: "job_2", company: { ...baseJob.company, name: "Alpha" } },
    ];

    const sorted = filterJobs(jobs, { sortBy: "company", sortDirection: "asc" });
    expect(sorted[0]?.company.name).toBe("Alpha");
  });
});
