import type { ProviderSearchParams, ProviderRawResult } from "../../../../providers/job-provider.interface.js";
import type { NormalizedJob } from "../../domain/entities/normalized-job.entity.js";
import type { ProviderHealthStatus } from "../../domain/value-objects/provider-health-status.vo.js";

export interface JobProviderPort {
  readonly providerName: string;
  search(params: ProviderSearchParams): Promise<ProviderRawResult>;
  normalize(raw: unknown): NormalizedJob;
  health(): Promise<ProviderHealthStatus>;
}
