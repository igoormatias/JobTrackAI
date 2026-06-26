import type { Job } from "./job";
import type { TimelineEvent } from "./timeline";

export type PipelineStage =
  | "favorite"
  | "applied"
  | "hr"
  | "technical_interview"
  | "manager"
  | "client"
  | "offer"
  | "rejected";

export type ApplicationStatus = "active" | "archived" | "withdrawn";

export type Application = {
  id: string;
  jobId: string;
  companyId: string;
  userId: string;
  stage: PipelineStage;
  status: ApplicationStatus;
  notes: string | null;
  nextStep: string | null;
  nextInterviewAt: string | null;
  job: Pick<Job, "id" | "title" | "company" | "modality" | "location" | "matchScore">;
  timeline: TimelineEvent[];
  appliedAt: string;
  updatedAt: string;
};

export type UpdateApplicationPayload = {
  stage?: PipelineStage;
  status?: ApplicationStatus;
  notes?: string | null;
  nextStep?: string | null;
  nextInterviewAt?: string | null;
};

export type PipelineColumn = {
  stage: PipelineStage;
  label: string;
  count: number;
  applications: Application[];
};

export type PipelineData = {
  columns: PipelineColumn[];
  totalApplications: number;
};
