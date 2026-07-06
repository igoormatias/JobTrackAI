import type { UseCase } from "../../../../shared/application/use-case.js";
import type { Job, JobListParams, JobListResult } from "../../../jobs/types/job.types.js";
import type { JobCatalogRepository } from "../../domain/repositories/job-catalog.repository.js";
import type { CatalogListFilters } from "../../domain/value-objects/catalog-list-filters.js";
import { prismaJobCatalogRepository } from "../../infrastructure/repositories/prisma-job-catalog.repository.js";
import { loadMatchProfileForUser } from "../mappers/match-profile.mapper.js";

export { loadMatchProfileForUser };

const toCatalogFilters = (userId: string, params: JobListParams, profile: Awaited<ReturnType<typeof loadMatchProfileForUser>>): CatalogListFilters => ({
  userId,
  profile,
  ...params,
  strictProfileMatch:
    params.strictProfileMatch === true ||
    params.suggested === true ||
    params.matchMin !== undefined ||
    Boolean(params.areas?.length) ||
    Boolean(params.skills?.length),
});

export class ListCatalogJobsUseCase implements UseCase<{ userId: string; params: JobListParams }, JobListResult> {
  constructor(private readonly catalogRepository: JobCatalogRepository = prismaJobCatalogRepository) {}

  async execute(input: { userId: string; params: JobListParams }): Promise<JobListResult> {
    const profile = await loadMatchProfileForUser(input.userId);
    return this.catalogRepository.list(toCatalogFilters(input.userId, input.params, profile));
  }
}

export class GetCatalogJobUseCase implements UseCase<{ userId: string; jobId: string }, Job | null> {
  constructor(private readonly catalogRepository: JobCatalogRepository = prismaJobCatalogRepository) {}

  async execute(input: { userId: string; jobId: string }): Promise<Job | null> {
    const profile = await loadMatchProfileForUser(input.userId);
    return this.catalogRepository.findById(input.jobId, { userId: input.userId, profile });
  }
}

export class CountCatalogJobsUseCase implements UseCase<{ userId: string; params: JobListParams }, number> {
  constructor(private readonly catalogRepository: JobCatalogRepository = prismaJobCatalogRepository) {}

  async execute(input: { userId: string; params: JobListParams }): Promise<number> {
    const profile = await loadMatchProfileForUser(input.userId);
    return this.catalogRepository.count(toCatalogFilters(input.userId, input.params, profile));
  }
}

export const listCatalogJobsUseCase = new ListCatalogJobsUseCase();
export const getCatalogJobUseCase = new GetCatalogJobUseCase();
export const countCatalogJobsUseCase = new CountCatalogJobsUseCase();
