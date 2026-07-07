import type { PipelineStage } from "../constants/pipeline-stages.js";
import type { TimelineEventType } from "../../../shared/domain/timeline-event-type.js";

export type TimelineEvent = {
  id: string;
  applicationId: string;
  type: TimelineEventType;
  title: string;
  description?: string | null;
  occurredAt: string;
  metadata?: Record<string, unknown> | null;
};

export type ApplicationStatus = "active" | "archived" | "withdrawn";

export type PipelineApplicationJob = {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  modality: string;
  location: string;
  area: string;
  matchScore: {
    score: number;
    label: string;
    reasons: { id: string; label: string; matched: boolean }[];
    missingSkills: { id: string; name: string }[];
  };
  technologies: { id: string; name: string; slug: string }[];
  sourceUrl: string;
  status: string;
  isFavorite: boolean;
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
  timeline?: TimelineEvent[];
  appliedAt: string;
  updatedAt: string;
  lastStageUpdatedAt?: string;
};

export type PipelineColumn = {
  stage: PipelineStage;
  label: string;
  count: number;
  applications: Application[];
};

export type PipelineKpis = {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
  conversionRate: number;
  avgDaysPerStage: number;
};

export type PipelineData = {
  columns: PipelineColumn[];
  totalApplications: number;
  kpis: PipelineKpis;
};

export type PipelineListParams = {
  q?: string;
  companyId?: string;
  stage?: PipelineStage;
  area?: string;
  technology?: string;
  matchMin?: number;
  isFavorite?: boolean;
  sortBy?: "recent" | "match" | "company" | "updated" | "favorite" | "priority" | "salary";
  sortDirection?: "asc" | "desc";
};
