import type { JobPriority } from "../../../../shared/domain/job-priority.js";
import type { JobSource } from "../../../../shared/domain/job-source.js";
import type { JobVisibility } from "../../../../shared/domain/job-visibility.js";
import type { PipelineStage } from "../../../../shared/domain/pipeline-stage.js";
import type { TimelineEventType } from "../../../../shared/domain/timeline-event-type.js";

export type TrackingStatus = "active" | "archived" | "withdrawn";

export type TrackingJobSnapshot = {
  id: string;
  title: string;
  company: { id: string; name: string; slug: string; logoUrl: string | null };
  modality: string;
  location: string;
  area: string;
  matchScore: {
    score: number;
    label: string;
    reasons: Array<{ id: string; label: string; matched: boolean } | string>;
    missingSkills: Array<{ id: string; name: string }>;
  };
  technologies: Array<{ id: string; name: string; slug: string }>;
  sourceUrl: string | null;
  source: JobSource;
  status: string;
  isFavorite: boolean;
  priority: JobPriority;
  visibility: JobVisibility;
  updatedAt: string;
};

export type TrackingTimelineEvent = {
  id: string;
  trackingId: string;
  type: TimelineEventType;
  title: string;
  occurredAt: string;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  createdById: string;
  createdAt: string;
};

export type JobTrackingEntity = {
  id: string;
  userId: string;
  jobId: string;
  companyId: string;
  stage: PipelineStage;
  status: TrackingStatus;
  isFavorite: boolean;
  priority: JobPriority;
  visibility: JobVisibility;
  hiddenAt: string | null;
  notes: string | null;
  feedback: string | null;
  recruiterName: string | null;
  recruiterEmail: string | null;
  recruiterPhone: string | null;
  negotiatedSalary: number | null;
  processLinks: Record<string, string> | null;
  aiAnalysisStatus: string;
  aiAnalyzedAt: string | null;
  nextInterviewAt: string | null;
  lastStageUpdatedAt: string | null;
  job: TrackingJobSnapshot;
  timeline: TrackingTimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

export type CreateManualJobInput = {
  companyName: string;
  title: string;
  sourceUrl?: string | null;
  description?: string | null;
  source: JobSource;
  area?: string;
  modality?: string;
  location?: string;
};

export type CreateTrackingInput = {
  userId: string;
  jobId?: string;
  job?: CreateManualJobInput;
  stage: PipelineStage;
  stageOccurredAt: string;
  notes?: string | null;
};

export type MoveTrackingStageInput = {
  stage: PipelineStage;
  occurredAt: string;
};

export type UpdateTrackingVisibilityInput = {
  visibility: JobVisibility;
};

export type UpdateTrackingNotesInput = {
  notes: string | null;
};

export type UpdateProcessInput = {
  notes?: string | null;
  feedback?: string | null;
  priority?: JobPriority;
  isFavorite?: boolean;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  recruiterPhone?: string | null;
  negotiatedSalary?: number | null;
  processLinks?: Record<string, string> | null;
};

export type UpdateTimelineEventInput = {
  occurredAt?: string;
  notes?: string | null;
};
