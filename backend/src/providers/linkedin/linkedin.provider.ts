import { NotImplementedError } from "../../shared/errors/not-implemented-error.js";
import type { JobFetchParams, JobProvider, JobProviderResult } from "../job-provider.interface.js";

export class LinkedinProvider implements JobProvider {
  readonly name = "linkedin";

  async fetchJobs(_params: JobFetchParams): Promise<JobProviderResult> {
    throw new NotImplementedError("LinkedIn provider will be implemented in the jobs stage");
  }
}
