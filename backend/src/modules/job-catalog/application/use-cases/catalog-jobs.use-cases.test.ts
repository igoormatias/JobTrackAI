import { describe, expect, it, vi } from "vitest";

import type { JobCatalogRepository } from "../../domain/repositories/job-catalog.repository.js";
import { ListCatalogJobsUseCase } from "./catalog-jobs.use-cases.js";

vi.mock("../mappers/match-profile.mapper.js", () => ({
  loadMatchProfileForUser: vi.fn().mockResolvedValue({
    area: "frontend",
    skills: ["react"],
    seniority: "senior",
    modalities: ["remote"],
  }),
}));

describe("ListCatalogJobsUseCase", () => {
  it("delegates listing to JobCatalogRepository", async () => {
    const list = vi.fn().mockResolvedValue({
      data: [],
      meta: {
        limit: 20,
        total: 0,
        hasMore: false,
        nextCursor: null,
        jobsWithSalary: 0,
        salaryCoverageRatio: 0,
      },
    });

    const repository = { list } as unknown as JobCatalogRepository;
    const useCase = new ListCatalogJobsUseCase(repository);

    const result = await useCase.execute({ userId: "user_1", params: { limit: 20 } });

    expect(list).toHaveBeenCalledWith(expect.objectContaining({ userId: "user_1", limit: 20 }));
    expect(result.meta.total).toBe(0);
  });

  it("applies curated profile area when suggested and no explicit areas", async () => {
    const list = vi.fn().mockResolvedValue({
      data: [],
      meta: { limit: 20, total: 0, hasMore: false, nextCursor: null },
    });

    const repository = { list } as unknown as JobCatalogRepository;
    const useCase = new ListCatalogJobsUseCase(repository);

    await useCase.execute({
      userId: "user_1",
      params: { limit: 20, suggested: true },
    });

    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({
        areas: ["frontend"],
        suggested: true,
      }),
    );
  });

  it("strips matchMin and strictProfileMatch from catalog filters", async () => {
    const list = vi.fn().mockResolvedValue({
      data: [],
      meta: { limit: 20, total: 0, hasMore: false, nextCursor: null },
    });

    const repository = { list } as unknown as JobCatalogRepository;
    const useCase = new ListCatalogJobsUseCase(repository);

    await useCase.execute({
      userId: "user_1",
      params: { limit: 20, matchMin: 70, strictProfileMatch: true },
    });

    const call = list.mock.calls[0]?.[0];
    expect(call).not.toHaveProperty("matchMin");
    expect(call).not.toHaveProperty("strictProfileMatch");
  });
});
