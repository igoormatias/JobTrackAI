export type ExistingJobMatch = {
  id: string;
  source: string;
  externalId?: string | null;
  contentHash?: string | null;
  sourceUrl?: string | null;
};

export interface DedupLookupRepository {
  findBySourceAndExternalId(source: string, externalId: string): Promise<ExistingJobMatch | null>;
  findByContentHash(contentHash: string): Promise<ExistingJobMatch | null>;
  findBySourceUrl(sourceUrl: string): Promise<ExistingJobMatch | null>;
  countCatalogJobs(): Promise<number>;
}
