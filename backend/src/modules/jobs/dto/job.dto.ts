import type { Job, JobListResult } from "../types/job.types.js";

export type JobResponseDto = {
  data: Job;
  message?: string;
};

export type JobListResponseDto = JobListResult & {
  message?: string;
};
