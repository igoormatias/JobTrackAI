import { describe, expect, it, vi } from "vitest";

import type { Job } from "../types/job.types.js";
import { JobDetailsService } from "./job-details.service.js";
import { JobService } from "./job.service.js";

const sampleJob = (id: string): Job => ({
  id,
  title: `Engineer ${id}`,
  slug: `engineer-${id}`,
  companyId: "company_1",
  company: { id: "company_1", name: "Company 1", slug: "company-1", logoUrl: null },
  area: "frontend",
  seniority: "senior",
  modality: "remote",
  location: "São Paulo, SP",
  salaryMin: 10000,
  salaryMax: 15000,
  currency: "BRL",
  description: "Desc",
  requirements: ["React"],
  benefits: ["VR"],
  technologies: [{ id: "t1", name: "React", slug: "react" }],
  source: "gupy",
  sourceUrl: "https://example.com",
  status: "active",
  isFavorite: false,
  isTracked: false,
  engagementState: "new",
  matchScore: {
    score: 88,
    label: "good",
    reasons: [{ id: "r1", label: "Stack", matched: true }],
    missingSkills: [{ id: "m1", name: "Docker" }],
  },
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe("JobDetailsService", () => {
  it("returns job match with compatibility label", async () => {
    const jobs = {
      getJobById: vi.fn().mockResolvedValue(sampleJob("job_0001")),
      findRelatedJobs: vi.fn(),
    } as unknown as JobService;

    const service = new JobDetailsService(jobs);
    const match = await service.getJobMatch("user_1", "job_0001");

    expect(match.matchScore.score).toBe(88);
    expect(match.compatibilityLabel).toBeTruthy();
    expect(match.engineVersion).toBe("rules-v4");
  });

  it("returns related jobs from catalog query", async () => {
    const jobs = {
      getJobById: vi.fn().mockResolvedValue(sampleJob("job_0001")),
      findRelatedJobs: vi.fn().mockResolvedValue([sampleJob("job_0002")]),
    } as unknown as JobService;

    const service = new JobDetailsService(jobs);
    const related = await service.getRelatedJobs("user_1", "job_0001");

    expect(related).toHaveLength(1);
    expect(jobs.findRelatedJobs).toHaveBeenCalled();
  });

  it("returns insights and learning gaps", async () => {
    const jobs = {
      getJobById: vi.fn().mockResolvedValue(sampleJob("job_0010")),
      findRelatedJobs: vi.fn(),
    } as unknown as JobService;

    const service = new JobDetailsService(jobs);
    const insights = await service.getJobInsights("user_1", "job_0010");
    const gaps = await service.getLearningGaps("user_1", "job_0010");

    expect(insights.length).toBeGreaterThan(0);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps[0]?.slug).toBeTruthy();
  });
});
