import type { NormalizedJob } from "../../modules/job-aggregation/domain/entities/normalized-job.entity.js";
import type { ProviderHealthStatus } from "../../modules/job-aggregation/domain/value-objects/provider-health-status.vo.js";
import { NotImplementedError } from "../../shared/errors/not-implemented-error.js";
import type { JobProvider, ProviderRawResult, ProviderSearchParams } from "../job-provider.interface.js";

export class ProgramathorProvider implements JobProvider {
  readonly providerName = "programathor";

  async search(_params: ProviderSearchParams): Promise<ProviderRawResult> {
    throw new NotImplementedError("Programathor provider search is not implemented yet");
  }

  normalize(raw: unknown): NormalizedJob {
    const item = raw as Partial<NormalizedJob>;
    return {
      title: item.title ?? "Programathor Job",
      company: item.company ?? "Unknown",
      description: item.description ?? "",
      technologies: item.technologies ?? [],
      seniority: item.seniority ?? null,
      modality: item.modality ?? null,
      location: item.location ?? null,
      salaryMin: item.salaryMin ?? null,
      salaryMax: item.salaryMax ?? null,
      sourceUrl: item.sourceUrl ?? "https://programathor.com.br",
      provider: this.providerName,
      publishedAt: item.publishedAt ?? new Date(),
      contentHash: item.contentHash ?? "programathor-stub",
      externalId: item.externalId ?? "programathor-stub",
    };
  }

  async health(): Promise<ProviderHealthStatus> {
    return {
      provider: this.providerName,
      status: "degraded",
      message: "Programathor provider is stub-only in Etapa 17",
      checkedAt: new Date(),
    };
  }
}

export const programathorProvider = new ProgramathorProvider();
