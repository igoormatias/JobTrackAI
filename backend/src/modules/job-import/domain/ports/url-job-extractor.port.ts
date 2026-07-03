import type { NormalizedJob } from "../../../job-aggregation/domain/entities/normalized-job.entity.js";
import type { JobSource } from "../../../../shared/domain/job-source.js";

export interface UrlJobExtractor {
  readonly source: JobSource;
  supports(url: string): boolean;
  extract(url: string): Promise<NormalizedJob>;
}
