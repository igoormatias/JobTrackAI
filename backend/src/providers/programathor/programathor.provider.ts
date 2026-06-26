import { NotImplementedError } from "../../shared/errors/not-implemented-error.js";
import type { JobFetchParams, JobProvider, JobProviderResult } from "../job-provider.interface.js";

export class ProgramathorProvider implements JobProvider {
  readonly name = "programathor";

  async fetchJobs(_params: JobFetchParams): Promise<JobProviderResult> {
    throw new NotImplementedError("ProgramaThor provider will be implemented in the jobs stage");
  }
}
