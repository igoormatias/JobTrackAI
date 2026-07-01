import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { jobRepository, type JobRepository } from "../repositories/job.repository.js";
import type { Job, JobListParams, JobListResult } from "../types/job.types.js";

const toArray = (value?: string | string[]): string[] | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
};

const normalizeParams = (params: JobListParams): JobListParams => ({
  ...params,
  q: params.q ?? params.search,
  areas: params.areas ?? toArray(params.areas as unknown as string),
  companyIds: params.companyIds ?? toArray(params.companyIds as unknown as string),
  seniorities: params.seniorities ?? toArray(params.seniorities as unknown as string),
  modalities: params.modalities ?? toArray(params.modalities as unknown as string),
  skills: params.skills ?? toArray(params.skills as unknown as string),
  sources: params.sources ?? (toArray(params.sources as unknown as string) as JobListParams["sources"]),
});

const filterJobs = (jobs: Job[], params: JobListParams): Job[] => {
  let result = [...jobs];
  const query = params.q?.toLowerCase();

  if (query) {
    result = result.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        job.technologies.some((tech) => tech.name.toLowerCase().includes(query)) ||
        job.requirements.some((req) => req.toLowerCase().includes(query)),
    );
  }

  if (params.areas?.length) {
    result = result.filter((job) => params.areas!.includes(job.area));
  }

  if (params.companyIds?.length) {
    result = result.filter((job) => params.companyIds!.includes(job.companyId));
  }

  if (params.seniorities?.length) {
    result = result.filter((job) => params.seniorities!.includes(job.seniority));
  }

  if (params.modalities?.length) {
    result = result.filter((job) => params.modalities!.includes(job.modality));
  }

  if (params.location) {
    const location = params.location.toLowerCase();
    result = result.filter((job) => job.location.toLowerCase().includes(location));
  }

  if (params.salaryMin !== undefined) {
    result = result.filter((job) => (job.salaryMax ?? 0) >= params.salaryMin!);
  }

  if (params.salaryMax !== undefined) {
    result = result.filter((job) => (job.salaryMin ?? Number.MAX_SAFE_INTEGER) <= params.salaryMax!);
  }

  if (params.skills?.length) {
    result = result.filter((job) =>
      params.skills!.every((skill) =>
        job.technologies.some((tech) => tech.slug === skill || tech.name.toLowerCase() === skill.toLowerCase()),
      ),
    );
  }

  if (params.matchMin !== undefined) {
    result = result.filter((job) => job.matchScore.score >= params.matchMin!);
  }

  if (params.isFavorite !== undefined) {
    result = result.filter((job) => job.isFavorite === params.isFavorite);
  }

  if (params.sources?.length) {
    result = result.filter((job) => params.sources!.includes(job.source));
  }

  const sortBy = params.sortBy ?? "match";
  const direction = params.sortDirection === "asc" ? 1 : -1;

  result.sort((a, b) => {
    switch (sortBy) {
      case "salary":
        return ((a.salaryMax ?? 0) - (b.salaryMax ?? 0)) * direction;
      case "title":
        return a.title.localeCompare(b.title) * direction;
      case "company":
        return a.company.name.localeCompare(b.company.name) * direction;
      case "date":
        return (new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()) * direction;
      case "match":
      default:
        return (a.matchScore.score - b.matchScore.score) * direction;
    }
  });

  return result;
};

const paginate = (jobs: Job[], params: JobListParams): JobListResult => {
  const limit = params.limit ?? 20;
  let startIndex = 0;

  if (params.cursor) {
    const foundIndex = jobs.findIndex((job) => job.id === params.cursor);
    startIndex = foundIndex >= 0 ? foundIndex + 1 : 0;
  }

  const data = jobs.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < jobs.length;

  return {
    data,
    meta: {
      limit,
      total: jobs.length,
      hasMore,
      nextCursor: hasMore ? data[data.length - 1]?.id ?? null : null,
    },
  };
};

export class JobService {
  constructor(private readonly repository: JobRepository = jobRepository) {}

  listJobs(params: JobListParams): JobListResult {
    const normalized = normalizeParams(params);
    const filtered = filterJobs(this.repository.findAll(), normalized);
    return paginate(filtered, normalized);
  }

  getJobById(id: string): Job {
    const job = this.repository.findById(id);
    if (!job) {
      throw new NotFoundError("Job not found");
    }
    return job;
  }

  favoriteJob(id: string, isFavorite: boolean): Job {
    const job = this.repository.setFavorite(id, isFavorite);
    if (!job) {
      throw new NotFoundError("Job not found");
    }
    return job;
  }

  markViewed(id: string): Job {
    const job = this.repository.markViewed(id);
    if (!job) {
      throw new NotFoundError("Job not found");
    }
    return job;
  }

  applyToJob(id: string): Job {
    const job = this.repository.apply(id);
    if (!job) {
      throw new NotFoundError("Job not found");
    }
    return job;
  }

  removeApplication(id: string): Job {
    const job = this.repository.removeApplication(id);
    if (!job) {
      throw new NotFoundError("Job not found");
    }
    return job;
  }
}

export const jobService = new JobService();
