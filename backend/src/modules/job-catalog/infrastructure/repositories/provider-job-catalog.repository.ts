import { NotImplementedError } from "../../../../shared/errors/not-implemented-error.js";
import type { Job } from "../../../jobs/types/job.types.js";
import type {
  JobCatalogRepository,
  RelatedJobsQuery,
} from "../../domain/repositories/job-catalog.repository.js";
import type {
  CatalogJobUpsertInput,
  CatalogListFilters,
  CatalogListResult,
  UserJobContextQuery,
} from "../../domain/value-objects/catalog-list-filters.js";

/**
 * V2 placeholder — will ingest jobs from JobProvider + normalizer pipeline.
 * Use cases must depend on JobCatalogRepository, not providers directly.
 */
export class ProviderJobCatalogRepository implements JobCatalogRepository {
  async list(_filters: CatalogListFilters): Promise<CatalogListResult<Job>> {
    throw new NotImplementedError("Provider catalog ingestion is planned for V2");
  }

  async count(_filters: CatalogListFilters): Promise<number> {
    throw new NotImplementedError("Provider catalog ingestion is planned for V2");
  }

  async findById(_id: string, _context: UserJobContextQuery): Promise<Job | null> {
    throw new NotImplementedError("Provider catalog ingestion is planned for V2");
  }

  async findRelated(_query: RelatedJobsQuery): Promise<Job[]> {
    throw new NotImplementedError("Provider catalog ingestion is planned for V2");
  }

  async upsertCatalogJob(_data: CatalogJobUpsertInput): Promise<Job> {
    throw new NotImplementedError("Provider catalog ingestion is planned for V2");
  }

  async upsertManyCatalogJobs(_data: CatalogJobUpsertInput[]): Promise<number> {
    throw new NotImplementedError("Provider catalog ingestion is planned for V2");
  }
}
