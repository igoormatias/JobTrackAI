import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Job } from "../types/job.types.js";
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
  engagementState: "new",
  matchScore: { score: 80, label: "good", reasons: [], missingSkills: [] },
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

vi.mock("../../job-catalog/application/use-cases/catalog-jobs.use-cases.js", () => ({
  listCatalogJobsUseCase: { execute: vi.fn() },
  getCatalogJobUseCase: { execute: vi.fn() },
}));

import {
  getCatalogJobUseCase,
  listCatalogJobsUseCase,
} from "../../job-catalog/application/use-cases/catalog-jobs.use-cases.js";

describe("JobService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists jobs via catalog use case", async () => {
    vi.mocked(listCatalogJobsUseCase.execute).mockResolvedValue({
      data: [sampleJob("job_0001")],
      meta: { limit: 10, total: 1, hasMore: false, nextCursor: null },
    });

    const service = new JobService();
    const result = await service.listJobs("user_1", { limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(listCatalogJobsUseCase.execute).toHaveBeenCalled();
  });

  it("gets job by id via catalog use case", async () => {
    vi.mocked(getCatalogJobUseCase.execute).mockResolvedValue(sampleJob("job_0002"));

    const service = new JobService();
    const job = await service.getJobById("user_1", "job_0002");

    expect(job.id).toBe("job_0002");
  });
});
