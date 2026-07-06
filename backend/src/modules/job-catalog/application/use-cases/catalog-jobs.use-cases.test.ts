import { describe, expect, it, vi } from "vitest";

import type { JobCatalogRepository } from "../../domain/repositories/job-catalog.repository.js";
import { ListCatalogJobsUseCase } from "./catalog-jobs.use-cases.js";

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
});
