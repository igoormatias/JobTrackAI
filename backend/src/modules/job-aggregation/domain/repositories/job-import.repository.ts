import type { CreateJobImportInput, JobImportRecord } from "../entities/job-import.entity.js";

export interface JobImportRepository {
  create(input: CreateJobImportInput): Promise<JobImportRecord>;
  createMany(inputs: CreateJobImportInput[]): Promise<void>;
}
