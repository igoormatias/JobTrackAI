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
  | "hired"
  | "rejected";

export type ApplicationStatus = "active" | "archived" | "withdrawn";

export type PipelineApplicationJob = Pick<
  Job,
  | "id"
  | "title"
  | "company"
  | "modality"
  | "location"
  | "matchScore"
  | "technologies"
  | "sourceUrl"
  | "area"
  | "isFavorite"
> & {
  updatedAt: string;
};

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
  job: PipelineApplicationJob;
  timeline: TimelineEvent[];
  appliedAt: string;
  updatedAt: string;
  lastStageUpdatedAt?: string;
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
  kpis: PipelineKpis;
};

export type PipelineKpis = {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
  conversionRate: number;
  avgDaysPerStage: number;
};

export type PipelineListParams = {
  q?: string;
  companyId?: string;
  stage?: PipelineStage;
  area?: string;
  technology?: string;
  matchMin?: number;
  isFavorite?: boolean;
  sortBy?: "recent" | "match" | "company" | "updated";
  sortDirection?: "asc" | "desc";
};
