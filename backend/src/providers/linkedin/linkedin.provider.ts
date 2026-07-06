import type { NormalizedJob } from "../../modules/job-aggregation/domain/entities/normalized-job.entity.js";
import type { ProviderHealthStatus } from "../../modules/job-aggregation/domain/value-objects/provider-health-status.vo.js";
import {
  computeContentHash,
  normalizeSourceUrl,
} from "../../modules/job-aggregation/domain/services/job-normalizer.service.js";
import type { JobProvider, ProviderRawResult, ProviderSearchParams } from "../job-provider.interface.js";
import { parseLinkedinSearchHtml } from "./linkedin-html.parser.js";
import {
  LINKEDIN_DEFAULT_PARAMS,
  LINKEDIN_JOBS_API_URL,
  LINKEDIN_HEADERS,
} from "./linkedin.constants.js";
import type { LinkedinRawJob } from "./linkedin.types.js";

const mapModality = (location?: string, remoteHint?: boolean): string | null => {
  if (remoteHint) return "remote";
  if (!location) return null;
  const lower = location.toLowerCase();
  if (lower.includes("remote") || lower.includes("remoto")) return "remote";
  if (lower.includes("hybrid") || lower.includes("híbrido")) return "hybrid";
  return null;
};

const mapLinkedinJob = (raw: LinkedinRawJob): NormalizedJob => {
  const publishedAt = raw.publishedDate ? new Date(raw.publishedDate) : new Date();
  const sourceUrl = normalizeSourceUrl(raw.sourceUrl);

  const job: NormalizedJob = {
    title: raw.title.trim(),
    company: raw.company.trim(),
    description: raw.description?.trim() || `${raw.title} na ${raw.company}`,
    technologies: [],
    seniority: null,
    modality: raw.modality ?? mapModality(raw.location),
    location: raw.location ?? null,
    salaryMin: raw.salaryMin ?? null,
    salaryMax: raw.salaryMax ?? null,
    sourceUrl,
    provider: "linkedin",
    publishedAt,
    externalId: raw.externalId,
    contentHash: "",
  };

  return { ...job, contentHash: computeContentHash(job) };
};

export class LinkedinProvider implements JobProvider {
  readonly providerName = "linkedin";

  async search(params: ProviderSearchParams): Promise<ProviderRawResult> {
    const limit = params.limit ?? 25;
    const offset = params.offset ?? 0;

    const url = new URL(LINKEDIN_JOBS_API_URL);
    url.searchParams.set("start", String(offset));
    if (params.keywords) url.searchParams.set("keywords", params.keywords);
    if (params.location) url.searchParams.set("location", params.location);
    for (const [key, value] of Object.entries(LINKEDIN_DEFAULT_PARAMS)) {
      url.searchParams.set(key, value);
    }
    if (params.workplaceTypes === "remote") {
      url.searchParams.set("f_WT", "2");
    }

    const response = await fetch(url.toString(), { headers: LINKEDIN_HEADERS });
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    const html = await response.text();
    const parsed = parseLinkedinSearchHtml(html);
    const jobs = parsed.slice(0, limit);
    const hasMore = parsed.length >= limit;

    return { jobs, hasMore };
  }

  normalize(raw: unknown): NormalizedJob {
    return mapLinkedinJob(raw as LinkedinRawJob);
  }

  async health(): Promise<ProviderHealthStatus> {
    try {
      const url = new URL(LINKEDIN_JOBS_API_URL);
      url.searchParams.set("start", "0");
      url.searchParams.set("keywords", "developer");
      url.searchParams.set("location", "Brazil");
      for (const [key, value] of Object.entries(LINKEDIN_DEFAULT_PARAMS)) {
        url.searchParams.set(key, value);
      }

      const response = await fetch(url.toString(), { headers: LINKEDIN_HEADERS });
      if (!response.ok) {
        return {
          provider: this.providerName,
          status: "unhealthy",
          message: `LinkedIn guest API returned ${response.status}`,
          checkedAt: new Date(),
        };
      }

      const html = await response.text();
      const jobs = parseLinkedinSearchHtml(html);

      return {
        provider: this.providerName,
        status: jobs.length > 0 ? "healthy" : "degraded",
        message: jobs.length > 0 ? undefined : "LinkedIn returned empty results",
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

export const linkedinProvider = new LinkedinProvider();
