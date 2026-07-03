import type { Job } from "../../../jobs/types/job.types.js";
import type {
  CatalogJobUpsertInput,
  CatalogListFilters,
  CatalogListResult,
  UserJobContextQuery,
} from "../value-objects/catalog-list-filters.js";

export type RelatedJobsQuery = {
  userId: string;
  jobId: string;
  area: string;
  technologySlugs: string[];
  profile?: UserJobContextQuery["profile"];
  limit?: number;
};

export interface JobCatalogRepository {
  list(filters: CatalogListFilters): Promise<CatalogListResult<Job>>;
  count(filters: CatalogListFilters): Promise<number>;
  findById(id: string, context: UserJobContextQuery): Promise<Job | null>;
  findRelated(query: RelatedJobsQuery): Promise<Job[]>;
  upsertCatalogJob(data: CatalogJobUpsertInput): Promise<Job>;
  upsertManyCatalogJobs(data: CatalogJobUpsertInput[]): Promise<{ imported: number; updated: number }>;
  touchLastCheckedAt(source: string, externalIds: string[]): Promise<void>;
  markStaleByProvider(
    source: string,
    activeExternalIds: string[],
  ): Promise<{ count: number; closedJobIds: string[] }>;
}
