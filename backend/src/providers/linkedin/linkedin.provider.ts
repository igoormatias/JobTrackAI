import type { NormalizedJob } from "../../modules/job-aggregation/domain/entities/normalized-job.entity.js";
import type { ProviderHealthStatus } from "../../modules/job-aggregation/domain/value-objects/provider-health-status.vo.js";
import { NotImplementedError } from "../../shared/errors/not-implemented-error.js";
import type { JobProvider, ProviderRawResult, ProviderSearchParams } from "../job-provider.interface.js";

export class LinkedinProvider implements JobProvider {
  readonly providerName = "linkedin";

  async search(_params: ProviderSearchParams): Promise<ProviderRawResult> {
    throw new NotImplementedError("LinkedIn provider search is not implemented yet");
  }

  normalize(raw: unknown): NormalizedJob {
    const item = raw as Partial<NormalizedJob>;
    return {
      title: item.title ?? "LinkedIn Job",
      company: item.company ?? "Unknown",
      description: item.description ?? "",
      technologies: item.technologies ?? [],
      seniority: item.seniority ?? null,
      modality: item.modality ?? null,
      location: item.location ?? null,
      salaryMin: item.salaryMin ?? null,
      salaryMax: item.salaryMax ?? null,
      sourceUrl: item.sourceUrl ?? "https://linkedin.com/jobs",
      provider: this.providerName,
      publishedAt: item.publishedAt ?? new Date(),
      contentHash: item.contentHash ?? "linkedin-stub",
      externalId: item.externalId ?? "linkedin-stub",
    };
  }

  async health(): Promise<ProviderHealthStatus> {
    return {
      provider: this.providerName,
      status: "degraded",
      message: "LinkedIn provider is stub-only in Etapa 17",
      checkedAt: new Date(),
    };
  }
}

export const linkedinProvider = new LinkedinProvider();
