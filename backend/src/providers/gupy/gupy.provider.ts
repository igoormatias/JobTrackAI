import type { NormalizedJob } from "../../modules/job-aggregation/domain/entities/normalized-job.entity.js";
import type { ProviderHealthStatus } from "../../modules/job-aggregation/domain/value-objects/provider-health-status.vo.js";
import {
  computeContentHash,
  normalizeSourceUrl,
} from "../../modules/job-aggregation/domain/services/job-normalizer.service.js";
import type { JobProvider, ProviderRawResult, ProviderSearchParams } from "../job-provider.interface.js";
import { GUPY_API_URL, GUPY_DEFAULT_LIMIT, GUPY_HEADERS } from "./gupy.constants.js";
import type { GupyApiResponse, GupyRawJob } from "./gupy.types.js";

const STALE_DAYS = 3;

const mapModality = (workplaceType?: string): string | null => {
  switch (workplaceType) {
    case "remote":
      return "remote";
    case "hybrid":
      return "hybrid";
    case "on-site":
      return "onsite";
    default:
      return null;
  }
};

const extractExternalId = (raw: GupyRawJob): string => {
  if (raw.id !== undefined) return String(raw.id);
  const normalized = normalizeSourceUrl(raw.jobUrl);
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1]?.split("?")[0] ?? normalized;
};

const resolveGupySourceUrl = (raw: GupyRawJob): string => {
  if (raw.jobUrl?.trim()) return normalizeSourceUrl(raw.jobUrl);
  if (raw.careerPageUrl?.trim()) return normalizeSourceUrl(raw.careerPageUrl);
  return "";
};

const mapGupyJob = (raw: GupyRawJob): NormalizedJob => {
  const publishedAt = raw.publishedDate ? new Date(raw.publishedDate) : new Date();
  const sourceUrl = resolveGupySourceUrl(raw);
  const location = [raw.city, raw.state].filter(Boolean).join(", ") || null;

  const job: NormalizedJob = {
    title: raw.name.trim(),
    company: raw.careerPageName.trim(),
    description: raw.description?.trim() || `${raw.name} na ${raw.careerPageName}`,
    technologies: raw.skills ?? [],
    modality: mapModality(raw.workplaceType),
    location,
    sourceUrl,
    provider: "gupy",
    publishedAt,
    externalId: extractExternalId(raw),
    contentHash: "",
  };

  return { ...job, contentHash: computeContentHash(job) };
};

const isStale = (job: GupyRawJob): boolean => {
  if (!job.publishedDate) return false;
  const cutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  return new Date(job.publishedDate).getTime() < cutoff;
};

export class GupyProvider implements JobProvider {
  readonly providerName = "gupy";

  async search(params: ProviderSearchParams): Promise<ProviderRawResult> {
    const limit = params.limit ?? GUPY_DEFAULT_LIMIT;
    const offset = params.offset ?? 0;

    const url = new URL(GUPY_API_URL);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    if (params.keywords) url.searchParams.set("jobName", params.keywords);
    if (params.location) url.searchParams.set("city", params.location);
    if (params.workplaceTypes) url.searchParams.set("workplaceTypes", params.workplaceTypes);

    const response = await fetch(url.toString(), { headers: GUPY_HEADERS });
    if (!response.ok) {
      throw new Error(`Gupy API error: ${response.status}`);
    }

    const body = (await response.json()) as GupyApiResponse;
    const jobs = body.data ?? [];
    const freshJobs = jobs.filter((job) => !isStale(job));
    const stoppedByStale = freshJobs.length < jobs.length;
    const hasMore = !stoppedByStale && jobs.length === limit;

    return { jobs: freshJobs, hasMore };
  }

  normalize(raw: unknown): NormalizedJob {
    return mapGupyJob(raw as GupyRawJob);
  }

  async health(): Promise<ProviderHealthStatus> {
    try {
      const url = new URL(GUPY_API_URL);
      url.searchParams.set("limit", "1");
      url.searchParams.set("offset", "0");

      const response = await fetch(url.toString(), { headers: GUPY_HEADERS });
      if (!response.ok) {
        return {
          provider: this.providerName,
          status: "unhealthy",
          message: `Gupy API returned ${response.status}`,
          checkedAt: new Date(),
        };
      }

      return {
        provider: this.providerName,
        status: "healthy",
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

export const gupyProvider = new GupyProvider();
