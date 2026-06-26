import { NotImplementedError } from "../../shared/errors/not-implemented-error.js";
import type { JobFetchParams, JobProvider, JobProviderResult } from "../job-provider.interface.js";

export class GupyProvider implements JobProvider {
  readonly name = "gupy";

  async fetchJobs(_params: JobFetchParams): Promise<JobProviderResult> {
    throw new NotImplementedError("Gupy provider will be implemented in the jobs stage");
  }
}
