import type { JobTrackingEntity } from "../../tracking/domain/entities/job-tracking.entity.js";
import { trackingService } from "../../tracking/application/tracking.service.js";
import {
  INTERVIEW_STAGES,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGES,
  type PipelineStage,
} from "../../../shared/domain/pipeline-stage.js";
import type {
  Application,
  PipelineColumn,
  PipelineData,
  PipelineKpis,
  PipelineListParams,
  TimelineEvent,
} from "../types/pipeline.types.js";

const toApplication = (tracking: JobTrackingEntity): Application => ({
  id: tracking.id,
  jobId: tracking.jobId,
  companyId: tracking.companyId,
  userId: tracking.userId,
  stage: tracking.stage,
  status: tracking.status,
  notes: tracking.notes,
  nextStep: null,
  nextInterviewAt: null,
  job: {
    id: tracking.job.id,
    title: tracking.job.title,
    company: tracking.job.company,
    modality: tracking.job.modality,
    location: tracking.job.location,
    area: tracking.job.area,
    matchScore: {
      score: tracking.job.matchScore.score,
      label: "low",
      reasons: [],
      missingSkills: [],
    },
    technologies: tracking.job.technologies,
    sourceUrl: tracking.job.sourceUrl ?? "",
    isFavorite: tracking.isFavorite,
    updatedAt: tracking.job.updatedAt,
  },
  timeline: tracking.timeline.map((event) => ({
    id: event.id,
    applicationId: tracking.id,
    type: event.type,
    title: event.title,
    occurredAt: event.occurredAt,
    metadata: event.metadata,
  })) as TimelineEvent[],
  appliedAt: tracking.lastStageUpdatedAt ?? tracking.createdAt,
  updatedAt: tracking.updatedAt,
  lastStageUpdatedAt: tracking.lastStageUpdatedAt ?? undefined,
});

const buildKpis = (applications: Application[]): PipelineKpis => {
  const interviews = applications.filter((app) => INTERVIEW_STAGES.includes(app.stage)).length;
  const offers = applications.filter((app) => app.stage === "offer" || app.stage === "hired").length;
  const rejections = applications.filter((app) => app.stage === "closed").length;
  const hired = applications.filter((app) => app.stage === "hired").length;
  const applied = applications.filter((app) => app.stage !== "discovery").length;

  return {
    totalApplications: applications.length,
    interviews,
    offers,
    rejections,
    conversionRate: applied > 0 ? Math.round((hired / applied) * 100) : 0,
    avgDaysPerStage: 4.2,
  };
};

const buildColumns = (applications: Application[]): PipelineColumn[] =>
  PIPELINE_STAGES.map((stage) => {
    const stageApps = applications.filter((app) => app.stage === stage);
    return {
      stage,
      label: PIPELINE_STAGE_LABELS[stage],
      count: stageApps.length,
      applications: stageApps,
    };
  });

export class PipelineService {
  async getPipeline(userId: string, params: PipelineListParams = {}): Promise<PipelineData> {
    const trackings = await trackingService.listAsync(userId, {
      q: params.q,
      companyId: params.companyId,
      stage: params.stage,
      area: params.area,
      isFavorite: params.isFavorite,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    });

    const applications = trackings.map(toApplication);

    return {
      columns: buildColumns(applications),
      totalApplications: applications.length,
      kpis: buildKpis(applications),
    };
  }

  async moveApplication(
    _userId: string,
    id: string,
    stage: PipelineStage,
    occurredAt: string,
  ): Promise<Application> {
    const updated = await trackingService.moveStage(id, { stage, occurredAt });
    return toApplication(updated);
  }

  async favoriteApplication(id: string): Promise<Application> {
    const updated = await trackingService.toggleFavorite(id);
    return toApplication(updated);
  }

  async archiveApplication(id: string): Promise<Application> {
    const updated = await trackingService.archive(id);
    return toApplication(updated);
  }

  async deleteApplication(id: string): Promise<void> {
    await trackingService.delete(id);
  }

  async getTimeline(id: string): Promise<TimelineEvent[]> {
    const events = await trackingService.getTimeline(id);
    return events.map((event) => ({
      id: event.id,
      applicationId: event.trackingId,
      type: event.type,
      title: event.title,
      occurredAt: event.occurredAt,
      metadata: event.metadata,
    })) as TimelineEvent[];
  }
}

export const pipelineService = new PipelineService();
