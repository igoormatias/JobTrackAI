import type { UseCase } from "../../../../shared/application/use-case.js";
import type { MatchProfileInput } from "../../../match/domain/services/match-engine.service.js";
import { prismaProfileRepository } from "../../../profiles/infrastructure/repositories/prisma-profile.repository.js";
import type { Job, JobListParams, JobListResult } from "../../../jobs/types/job.types.js";
import type { JobCatalogRepository } from "../../domain/repositories/job-catalog.repository.js";
import type { CatalogListFilters } from "../../domain/value-objects/catalog-list-filters.js";
import { prismaJobCatalogRepository } from "../../infrastructure/repositories/prisma-job-catalog.repository.js";

const toMatchProfile = async (userId: string): Promise<MatchProfileInput | null> => {
  const profile = await prismaProfileRepository.findByUserId(userId);
  if (!profile) return null;
  return {
    area: profile.area,
    seniority: profile.seniority,
    modality: profile.modality,
    location: profile.location,
    locationPreference: profile.locationPreference as MatchProfileInput["locationPreference"],
    salaryExpectation: profile.salaryExpectation as MatchProfileInput["salaryExpectation"],
    skillNames: profile.skillNames,
    blockedSkills: profile.blockedSkills,
  };
};

const toCatalogFilters = (userId: string, params: JobListParams, profile: MatchProfileInput | null): CatalogListFilters => ({
  userId,
  profile,
  ...params,
});

export class ListCatalogJobsUseCase implements UseCase<{ userId: string; params: JobListParams }, JobListResult> {
  constructor(private readonly catalogRepository: JobCatalogRepository = prismaJobCatalogRepository) {}

  async execute(input: { userId: string; params: JobListParams }): Promise<JobListResult> {
    const profile = await toMatchProfile(input.userId);
    return this.catalogRepository.list(toCatalogFilters(input.userId, input.params, profile));
  }
}

export class GetCatalogJobUseCase implements UseCase<{ userId: string; jobId: string }, Job | null> {
  constructor(private readonly catalogRepository: JobCatalogRepository = prismaJobCatalogRepository) {}

  async execute(input: { userId: string; jobId: string }): Promise<Job | null> {
    const profile = await toMatchProfile(input.userId);
    return this.catalogRepository.findById(input.jobId, { userId: input.userId, profile });
  }
}

export class CountCatalogJobsUseCase implements UseCase<{ userId: string; params: JobListParams }, number> {
  constructor(private readonly catalogRepository: JobCatalogRepository = prismaJobCatalogRepository) {}

  async execute(input: { userId: string; params: JobListParams }): Promise<number> {
    const profile = await toMatchProfile(input.userId);
    return this.catalogRepository.count(toCatalogFilters(input.userId, input.params, profile));
  }
}

export const listCatalogJobsUseCase = new ListCatalogJobsUseCase();
export const getCatalogJobUseCase = new GetCatalogJobUseCase();
export const countCatalogJobsUseCase = new CountCatalogJobsUseCase();
