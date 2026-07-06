export type JobImportStatus =
  | "imported"
  | "duplicate"
  | "failed"
  | "skipped"
  | "updated"
  | "alternate_attached";

export type JobImportRecord = {
  id: string;
  executionId: string;
  providerName: string;
  externalId?: string | null;
  sourceUrl?: string | null;
  contentHash?: string | null;
  status: JobImportStatus;
  jobId?: string | null;
  errorMessage?: string | null;
  createdAt: Date;
};

export type CreateJobImportInput = {
  executionId: string;
  providerName: string;
  externalId?: string | null;
  sourceUrl?: string | null;
  contentHash?: string | null;
  status: JobImportStatus;
  jobId?: string | null;
  errorMessage?: string | null;
};
