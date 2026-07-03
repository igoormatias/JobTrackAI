import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { loadMatchProfileForUser } from "../../job-catalog/application/mappers/match-profile.mapper.js";
import {
  getCatalogJobUseCase,
  listCatalogJobsUseCase,
} from "../../job-catalog/application/use-cases/catalog-jobs.use-cases.js";
import { prismaJobCatalogRepository } from "../../job-catalog/infrastructure/repositories/prisma-job-catalog.repository.js";
import {
  prismaJobRepository,
  type PrismaJobRepository,
} from "../infrastructure/repositories/prisma-job.repository.js";
import type { Job, JobListParams, JobListResult } from "../types/job.types.js";

export class JobService {
  constructor(
    private readonly engagementRepo: PrismaJobRepository = prismaJobRepository,
    private readonly catalogRepo = prismaJobCatalogRepository,
  ) {}

  async listJobs(userId: string, params: JobListParams): Promise<JobListResult> {
    return listCatalogJobsUseCase.execute({ userId, params });
  }

  async getJobById(userId: string, id: string): Promise<Job> {
    const job = await getCatalogJobUseCase.execute({ userId, jobId: id });
    if (!job) throw new NotFoundError("Job not found");
    return job;
  }

  async favoriteJob(userId: string, id: string, isFavorite: boolean): Promise<Job> {
    await this.engagementRepo.upsertFavorite(userId, id, isFavorite);
    return this.getJobById(userId, id);
  }

  async markViewed(userId: string, id: string): Promise<Job> {
    const job = await this.engagementRepo.markViewed(userId, id);
    if (!job) throw new NotFoundError("Job not found");
    return job;
  }

  async findRelatedJobs(userId: string, job: Job, limit = 5): Promise<Job[]> {
    const profile = await loadMatchProfileForUser(userId);
    return this.catalogRepo.findRelated({
      userId,
      jobId: job.id,
      area: job.area,
      technologySlugs: job.technologies.map((tech) => tech.slug),
      profile,
      limit,
    });
  }
}

export const jobService = new JobService();
