import type { NormalizedJob } from "../../modules/job-aggregation/domain/entities/normalized-job.entity.js";
import type { ProviderHealthStatus } from "../../modules/job-aggregation/domain/value-objects/provider-health-status.vo.js";
import {
  computeContentHash,
  normalizeSourceUrl,
} from "../../modules/job-aggregation/domain/services/job-normalizer.service.js";
import type { JobProvider, ProviderRawResult, ProviderSearchParams } from "../job-provider.interface.js";
import { parseProgramathorSearchHtml } from "./programathor-html.parser.js";
import {
  PROGRAMATHOR_DEFAULT_PAGE_SIZE,
  PROGRAMATHOR_HEADERS,
  PROGRAMATHOR_JOBS_URL,
} from "./programathor.constants.js";
import type { ProgramathorRawJob } from "./programathor.types.js";

const matchesKeywords = (job: ProgramathorRawJob, keywords: string): boolean => {
  const needle = keywords.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [job.title, job.company, ...(job.tags ?? [])].join(" ").toLowerCase();
  return haystack.includes(needle);
};

const mapProgramathorJob = (raw: ProgramathorRawJob): NormalizedJob => {
  const publishedAt = raw.publishedAt ? new Date(raw.publishedAt) : new Date();
  const sourceUrl = normalizeSourceUrl(raw.url);

  const job: NormalizedJob = {
    title: raw.title.trim(),
    company: raw.company.trim(),
    description: raw.description?.trim() || `${raw.title} na ${raw.company}`,
    technologies: raw.tags ?? [],
    seniority: raw.seniority ?? null,
    modality: raw.modality ?? null,
    location: raw.location ?? null,
    salaryMin: raw.salaryMin ?? null,
    salaryMax: raw.salaryMax ?? null,
    sourceUrl,
    provider: "programathor",
    publishedAt,
    externalId: raw.externalId,
    contentHash: "",
  };

  return { ...job, contentHash: computeContentHash(job) };
};

const buildSearchUrl = (params: ProviderSearchParams): string => {
  const pageSize = PROGRAMATHOR_DEFAULT_PAGE_SIZE;
  const offset = params.offset ?? 0;
  const page = Math.floor(offset / pageSize) + 1;

  const url = new URL(PROGRAMATHOR_JOBS_URL);
  if (page > 1) url.searchParams.set("page", String(page));
  if (params.location) url.searchParams.set("place", params.location);
  if (params.workplaceTypes === "remote") url.searchParams.set("remoto", "true");

  return url.toString();
};

export class ProgramathorProvider implements JobProvider {
  readonly providerName = "programathor";

  async search(params: ProviderSearchParams): Promise<ProviderRawResult> {
    const limit = params.limit ?? PROGRAMATHOR_DEFAULT_PAGE_SIZE;
    const offset = params.offset ?? 0;
    const pageSize = PROGRAMATHOR_DEFAULT_PAGE_SIZE;
    const skipWithinPage = offset % pageSize;

    const response = await fetch(buildSearchUrl(params), { headers: PROGRAMATHOR_HEADERS });
    if (!response.ok) {
      throw new Error(`Programathor listing error: ${response.status}`);
    }

    const html = await response.text();
    let parsed = parseProgramathorSearchHtml(html);

    if (params.keywords) {
      parsed = parsed.filter((job) => matchesKeywords(job, params.keywords!));
    }

    const jobs = parsed.slice(skipWithinPage, skipWithinPage + limit);
    const hasMore = parsed.length >= skipWithinPage + limit || parsed.length === pageSize;

    return { jobs, hasMore };
  }

  normalize(raw: unknown): NormalizedJob {
    return mapProgramathorJob(raw as ProgramathorRawJob);
  }

  async health(): Promise<ProviderHealthStatus> {
    try {
      const response = await fetch(PROGRAMATHOR_JOBS_URL, { headers: PROGRAMATHOR_HEADERS });
      if (!response.ok) {
        return {
          provider: this.providerName,
          status: "unhealthy",
          message: `Programathor listing returned ${response.status}`,
          checkedAt: new Date(),
        };
      }

      const html = await response.text();
      const jobs = parseProgramathorSearchHtml(html);

      return {
        provider: this.providerName,
        status: jobs.length > 0 ? "healthy" : "degraded",
        message: jobs.length > 0 ? undefined : "Programathor returned empty listing",
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        provider: this.providerName,
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Unknown error",
        checkedAt: new Date(),
      };
    }
  }
}

export const programathorProvider = new ProgramathorProvider();
