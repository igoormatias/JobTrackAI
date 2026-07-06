import type { Interview, Job, JobTracking, TimelineEvent } from "@prisma/client";

import { PIPELINE_STAGE_LABELS, type PipelineStage } from "../../../../shared/domain/pipeline-stage.js";
import type { JobPriority } from "../../../../shared/domain/job-priority.js";
import type { JobVisibility } from "../../../../shared/domain/job-visibility.js";
import type { TimelineEventType } from "../../../../shared/domain/timeline-event-type.js";
import {
  matchEngineService,
  type MatchProfileInput,
} from "../../../match/domain/services/match-engine.service.js";
import { parseJobMetadata, toMatchJobInput, toMatchScore } from "../../../jobs/infrastructure/mappers/job.mapper.js";
import type {
  JobTrackingEntity,
  TrackingTimelineEvent,
} from "../../domain/entities/job-tracking.entity.js";

const defaultMatchScore = () => ({
  score: 0,
  label: "low" as const,
  reasons: [] as string[],
  missingSkills: [] as Array<{ id: string; name: string }>,
});

export const mapTimelineEvent = (event: TimelineEvent): TrackingTimelineEvent => ({
  id: event.id,
  trackingId: event.trackingId,
  type: event.type as TimelineEventType,
  title: event.title,
  occurredAt: event.occurredAt.toISOString(),
  notes: event.notes,
  metadata: (event.metadata as Record<string, unknown> | null) ?? null,
  createdById: event.createdById,
  createdAt: event.createdAt.toISOString(),
});

export const mapTrackingToEntity = (
  tracking: JobTracking & { job: Job; timelineEvents: TimelineEvent[]; interviews?: Interview[] },
  profile?: MatchProfileInput | null,
): JobTrackingEntity => {
  const meta = parseJobMetadata(tracking.job.metadata);
  const company = meta.company ?? {
    id: tracking.job.companySlug ?? tracking.job.id,
    name: tracking.job.companyName,
    slug: tracking.job.companySlug ?? tracking.job.companyName.toLowerCase().replace(/\s+/g, "-"),
    logoUrl: null,
  };

  const persistedMatch =
    tracking.rulesMatchScore != null
      ? {
          score: tracking.rulesMatchScore,
          label: (tracking.rulesMatchLabel ?? "low") as "low" | "medium" | "high",
          reasons: (tracking.rulesMatchReasons as Array<{ id: string; label: string; matched: boolean } | string> | null) ?? [],
          missingSkills: [] as Array<{ id: string; name: string }>,
        }
      : null;

  const matchScore =
    persistedMatch ??
    (profile
      ? toMatchScore(matchEngineService.compute(profile, toMatchJobInput(tracking.job)))
      : defaultMatchScore());

  const upcomingInterview = tracking.interviews
    ?.filter((item) => item.scheduledAt >= new Date())
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];

  return {
    id: tracking.id,
    userId: tracking.userId,
    jobId: tracking.jobId,
    companyId: company.id,
    stage: tracking.stage as PipelineStage,
    status: tracking.status as JobTrackingEntity["status"],
    isFavorite: tracking.isFavorite,
    priority: tracking.priority as JobPriority,
    visibility: tracking.visibility as JobVisibility,
    hiddenAt: tracking.hiddenAt?.toISOString() ?? null,
    notes: tracking.notes,
    feedback: tracking.feedback,
    recruiterName: tracking.recruiterName,
    recruiterRole: tracking.recruiterRole,
    recruiterEmail: tracking.recruiterEmail,
    recruiterPhone: tracking.recruiterPhone,
    recruiterLinkedin: tracking.recruiterLinkedin,
    tags: tracking.tags ?? [],
    negotiatedSalary: tracking.negotiatedSalary,
    salaryExpectation: (tracking.salaryExpectation as JobTrackingEntity["salaryExpectation"]) ?? null,
    processLinks: (tracking.processLinks as Record<string, string> | null) ?? null,
    aiAnalysisStatus: tracking.aiAnalysisStatus,
    aiAnalyzedAt: tracking.aiAnalyzedAt?.toISOString() ?? null,
    nextInterviewAt: upcomingInterview?.scheduledAt.toISOString() ?? tracking.nextInterviewAt?.toISOString() ?? null,
    lastStageUpdatedAt: tracking.lastStageUpdatedAt?.toISOString() ?? null,
    job: {
      id: tracking.job.id,
      title: tracking.job.title,
      company: { id: company.id, name: company.name, slug: company.slug, logoUrl: company.logoUrl },
      modality: tracking.job.modality ?? "remote",
      location: tracking.job.location ?? "",
      area: tracking.job.area ?? "frontend",
      matchScore: {
        score: matchScore.score,
        label: matchScore.label,
        reasons: matchScore.reasons,
        missingSkills: matchScore.missingSkills,
      },
      technologies: meta.technologies ?? [],
      sourceUrl: tracking.job.sourceUrl,
      source: tracking.job.source as JobTrackingEntity["job"]["source"],
      status: tracking.job.status,
      salaryMin: tracking.job.salaryMin,
      salaryMax: tracking.job.salaryMax,
      isFavorite: tracking.isFavorite,
      priority: tracking.priority as JobPriority,
      visibility: tracking.visibility as JobVisibility,
      updatedAt: tracking.job.updatedAt.toISOString(),
    },
    timeline: tracking.timelineEvents
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
      .map(mapTimelineEvent),
    createdAt: tracking.createdAt.toISOString(),
    updatedAt: tracking.updatedAt.toISOString(),
  };
};

export const stageTitle = (stage: PipelineStage): string =>
  `Status: ${PIPELINE_STAGE_LABELS[stage]}`;
