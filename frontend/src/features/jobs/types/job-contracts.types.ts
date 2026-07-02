import type { Job, JobPriority, JobVisibility, PipelineStage } from "@/types";

/** @planned-etapa-12 — PATCH /jobs/:id/priority */
export type UpdateJobPriorityPayload = {
  priority: JobPriority;
};

/** @planned-etapa-12 — PATCH /jobs/:id/visibility */
export type UpdateJobVisibilityPayload = {
  visibility: JobVisibility;
};

/** @planned-etapa-12 — POST /jobs (cadastro manual) */
export type CreateManualJobPayload = {
  company: string;
  title: string;
  sourceUrl: string;
  description: string;
  appliedAt?: string;
  initialStage?: PipelineStage;
  notes?: string;
  source: "manual";
};

/** @planned-etapa-12 */
export type JobsServicePlanned = {
  updateJobPriority(id: string, payload: UpdateJobPriorityPayload): Promise<Job>;
  updateJobVisibility(id: string, payload: UpdateJobVisibilityPayload): Promise<Job>;
  createManualJob(payload: CreateManualJobPayload): Promise<Job>;
};
