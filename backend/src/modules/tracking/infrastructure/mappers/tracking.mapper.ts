import type { Interview, Job, JobTracking, TimelineEvent } from "@prisma/client";

import { PIPELINE_STAGE_LABELS, type PipelineStage } from "../../../../shared/domain/pipeline-stage.js";
import type { JobPriority } from "../../../../shared/domain/job-priority.js";
import type { JobVisibility } from "../../../../shared/domain/job-visibility.js";
import type { TimelineEventType } from "../../../../shared/domain/timeline-event-type.js";
import { parseJobMetadata } from "../../../jobs/infrastructure/mappers/job.mapper.js";
import type {
  JobTrackingEntity,
  TrackingTimelineEvent,
} from "../../domain/entities/job-tracking.entity.js";

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
): JobTrackingEntity => {
  const meta = parseJobMetadata(tracking.job.metadata);
  const company = meta.company ?? {
    id: tracking.job.companySlug ?? tracking.job.id,
    name: tracking.job.companyName,
    slug: tracking.job.companySlug ?? tracking.job.companyName.toLowerCase().replace(/\s+/g, "-"),
    logoUrl: null,
  };

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
    lastStageUpdatedAt: tracking.lastStageUpdatedAt?.toISOString() ?? null,
    job: {
      id: tracking.job.id,
      title: tracking.job.title,
      company: { id: company.id, name: company.name, slug: company.slug, logoUrl: company.logoUrl },
      modality: tracking.job.modality ?? "remote",
      location: tracking.job.location ?? "",
      area: tracking.job.area ?? "frontend",
      matchScore: { score: 0 },
      technologies: meta.technologies ?? [],
      sourceUrl: tracking.job.sourceUrl,
      source: tracking.job.source as JobTrackingEntity["job"]["source"],
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
