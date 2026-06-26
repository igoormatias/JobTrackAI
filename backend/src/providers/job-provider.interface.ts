export type JobFetchParams = {
  keywords?: string;
  location?: string;
  workplaceTypes?: string;
  limit?: number;
  offset?: number;
  page?: number;
};

export type JobProviderResult = {
  jobs: unknown[];
  hasMore: boolean;
};

export interface JobProvider {
  readonly name: string;
  fetchJobs(params: JobFetchParams): Promise<JobProviderResult>;
}
