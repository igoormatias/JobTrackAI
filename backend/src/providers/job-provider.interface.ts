import type { NormalizedJob } from "../modules/job-aggregation/domain/entities/normalized-job.entity.js";
import type { ProviderHealthStatus } from "../modules/job-aggregation/domain/value-objects/provider-health-status.vo.js";

export type ProviderSearchParams = {
  keywords?: string;
  location?: string;
  workplaceTypes?: string;
  limit?: number;
  offset?: number;
};

export type ProviderRawResult = {
  jobs: unknown[];
  hasMore: boolean;
};

export interface JobProvider {
  readonly providerName: string;
  search(params: ProviderSearchParams): Promise<ProviderRawResult>;
  normalize(raw: unknown): NormalizedJob;
  health(): Promise<ProviderHealthStatus>;
}

/** @deprecated Use ProviderSearchParams */
export type JobFetchParams = ProviderSearchParams;

/** @deprecated Use ProviderRawResult */
export type JobProviderResult = ProviderRawResult;
