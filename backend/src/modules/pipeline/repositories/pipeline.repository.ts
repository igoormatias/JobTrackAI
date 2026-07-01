import { jobRepository } from "../../jobs/repositories/job.repository.js";
import {
  INTERVIEW_STAGES,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGES,
  type PipelineStage,
} from "../constants/pipeline-stages.js";
import type { Application, ApplicationStatus, TimelineEvent } from "../types/pipeline.types.js";

const createTimelineEvent = (
  applicationId: string,
  index: number,
  type: string,
  title: string,
  occurredAt: string,
  metadata?: Record<string, unknown>,
): TimelineEvent => ({
  id: `timeline_${applicationId}_${index}`,
  applicationId,
  type,
  title,
  occurredAt,
  metadata: metadata ?? null,
});

const buildTimeline = (applicationId: string, stage: PipelineStage, appliedAt: string): TimelineEvent[] => {
  const events: TimelineEvent[] = [
    createTimelineEvent(applicationId, 1, "created", "Vaga favoritada", appliedAt),
    createTimelineEvent(applicationId, 2, "applied", "Candidatura enviada", appliedAt),
  ];

  if (!["favorite", "applied"].includes(stage)) {
    events.push(
      createTimelineEvent(
        applicationId,
        3,
        "stage_changed",
        `Avançou para ${PIPELINE_STAGE_LABELS.hr}`,
        appliedAt,
        { to: "hr" },
      ),
    );
  }

  if (INTERVIEW_STAGES.includes(stage) || stage === "offer" || stage === "hired") {
    events.push(
      createTimelineEvent(applicationId, 4, "interview_scheduled", "Entrevista agendada", appliedAt),
    );
  }

  if (stage === "offer" || stage === "hired") {
    events.push(createTimelineEvent(applicationId, 5, "offer_received", "Proposta recebida", appliedAt));
  }

  if (stage === "hired") {
    events.push(createTimelineEvent(applicationId, 6, "stage_changed", "Contratação confirmada", appliedAt, { to: "hired" }));
  }

  if (stage === "rejected") {
    events.push(createTimelineEvent(applicationId, 6, "rejected", "Processo encerrado", appliedAt));
  }

  return events;
};

const createApplication = (index: number, stage: PipelineStage): Application => {
  const jobs = jobRepository.findAll();
  const job = jobs[(index - 1) % jobs.length]!;
  const id = `application_${String(index).padStart(4, "0")}`;
  const appliedAt = new Date(Date.now() - index * 86_400_000).toISOString();
  const hasInterview = INTERVIEW_STAGES.includes(stage) || stage === "offer" || stage === "hired";

  return {
    id,
    jobId: job.id,
    companyId: job.companyId,
    userId: "user_0001",
    stage,
    status: "active",
    notes: null,
    nextStep: stage === "technical_interview" ? "Preparar live coding" : null,
    nextInterviewAt: hasInterview ? new Date(Date.now() + index * 86_400_000).toISOString() : null,
    job: {
      id: job.id,
      title: job.title,
      company: job.company,
      modality: job.modality,
      location: job.location,
      area: job.area,
      matchScore: job.matchScore,
      technologies: job.technologies,
      sourceUrl: job.sourceUrl,
      isFavorite: job.isFavorite,
      updatedAt: job.updatedAt,
    },
    timeline: buildTimeline(id, stage, appliedAt),
    appliedAt,
    updatedAt: new Date().toISOString(),
  };
};

export class PipelineRepository {
  private applications: Application[] = PIPELINE_STAGES.flatMap((stage, stageIndex) =>
    Array.from({ length: 2 }, (_, rowIndex) => {
      const index = stageIndex * 2 + rowIndex + 1;
      return createApplication(index, stage);
    }),
  );

  private favoriteJobIds = new Set(
    this.applications.filter((app) => app.stage === "favorite").map((app) => app.jobId),
  );

  findAll(): Application[] {
    return this.applications
      .filter((app) => app.status === "active")
      .map((app) => this.enrich(app));
  }

  findById(id: string): Application | null {
    const app = this.applications.find((item) => item.id === id);
    return app ? this.enrich(app) : null;
  }

  findByJobId(jobId: string): Application | null {
    const app = this.applications.find((item) => item.jobId === jobId && item.status === "active");
    return app ? this.enrich(app) : null;
  }

  updateStage(id: string, stage: PipelineStage): Application | null {
    const index = this.applications.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const current = this.applications[index]!;
    const previousStage = current.stage;
    const updated: Application = {
      ...current,
      stage,
      updatedAt: new Date().toISOString(),
      timeline:
        stage !== previousStage
          ? [
              ...current.timeline,
              createTimelineEvent(
                current.id,
                current.timeline.length + 1,
                "stage_changed",
                `Avançou para ${PIPELINE_STAGE_LABELS[stage]}`,
                new Date().toISOString(),
                { from: previousStage, to: stage },
              ),
            ]
          : current.timeline,
    };

    this.applications[index] = updated;
    return this.enrich(updated);
  }

  updateStatus(id: string, status: ApplicationStatus): Application | null {
    const index = this.applications.findIndex((item) => item.id === id);
    if (index === -1) return null;

    this.applications[index] = {
      ...this.applications[index]!,
      status,
      updatedAt: new Date().toISOString(),
    };

    return this.enrich(this.applications[index]!);
  }

  toggleFavorite(id: string): Application | null {
    const index = this.applications.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const current = this.applications[index]!;
    const isFavorite = !current.job.isFavorite;

    if (isFavorite) {
      this.favoriteJobIds.add(current.jobId);
    } else {
      this.favoriteJobIds.delete(current.jobId);
    }

    jobRepository.setFavorite(current.jobId, isFavorite);

    const updated: Application = {
      ...current,
      stage: isFavorite && current.stage === "applied" ? "favorite" : current.stage,
      job: { ...current.job, isFavorite },
      updatedAt: new Date().toISOString(),
    };

    this.applications[index] = updated;
    return this.enrich(updated);
  }

  delete(id: string): boolean {
    const index = this.applications.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.applications.splice(index, 1);
    return true;
  }

  private enrich(application: Application): Application {
    const job = jobRepository.findById(application.jobId);
    if (!job) return application;

    return {
      ...application,
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        modality: job.modality,
        location: job.location,
        area: job.area,
        matchScore: job.matchScore,
        technologies: job.technologies,
        sourceUrl: job.sourceUrl,
        isFavorite: job.isFavorite,
        updatedAt: job.updatedAt,
      },
    };
  }
}

export const pipelineRepository = new PipelineRepository();
