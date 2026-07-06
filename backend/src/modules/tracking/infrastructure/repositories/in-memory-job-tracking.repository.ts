import type { JobPriority } from "../../../../shared/domain/job-priority.js";
import type { JobSource } from "../../../../shared/domain/job-source.js";
import type { JobVisibility } from "../../../../shared/domain/job-visibility.js";
import {
  INTERVIEW_STAGES,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGES,
  type PipelineStage,
} from "../../../../shared/domain/pipeline-stage.js";
import type { TimelineEventType } from "../../../../shared/domain/timeline-event-type.js";
import { ConflictError } from "../../../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { createInMemoryJobRepository } from "../../../jobs/testing/in-memory-job.repository.js";
import type { Job } from "../../../jobs/types/job.types.js";
import type {
  CreateTrackingInput,
  JobTrackingEntity,
  MoveTrackingStageInput,
  TrackingTimelineEvent,
  UpdateProcessInput,
  UpdateTimelineEventInput,
} from "../../domain/entities/job-tracking.entity.js";

const jobRepository = createInMemoryJobRepository();

let trackingCounter = 1;
let timelineCounter = 1;

const createTimelineEvent = (
  trackingId: string,
  userId: string,
  type: TimelineEventType,
  title: string,
  occurredAt: string,
  notes: string | null = null,
  metadata: Record<string, unknown> | null = null,
): TrackingTimelineEvent => ({
  id: `timeline_${String(timelineCounter++).padStart(6, "0")}`,
  trackingId,
  type,
  title,
  occurredAt,
  notes,
  metadata,
  createdById: userId,
  createdAt: new Date().toISOString(),
});

const toJobSnapshot = (job: Job, tracking: Pick<JobTrackingEntity, "isFavorite" | "priority" | "visibility">): JobTrackingEntity["job"] => ({
  id: job.id,
  title: job.title,
  company: job.company,
  modality: job.modality,
  location: job.location,
  area: job.area,
  matchScore: {
    score: job.matchScore.score,
    label: job.matchScore.label ?? "low",
    reasons: job.matchScore.reasons ?? [],
    missingSkills: job.matchScore.missingSkills ?? [],
  },
  technologies: job.technologies,
  sourceUrl: job.sourceUrl,
  source: job.source as JobSource,
  status: job.status,
  salaryMin: job.salaryMin,
  salaryMax: job.salaryMax,
  isFavorite: tracking.isFavorite,
  priority: tracking.priority,
  visibility: tracking.visibility,
  updatedAt: job.updatedAt,
});

const buildSeedTimeline = (
  trackingId: string,
  userId: string,
  stage: PipelineStage,
  occurredAt: string,
): TrackingTimelineEvent[] => {
  const events: TrackingTimelineEvent[] = [
    createTimelineEvent(trackingId, userId, "created", "Processo iniciado", occurredAt, null, {
      stage,
      source: "seed",
    }),
  ];

  if (stage !== "discovery") {
    events.push(
      createTimelineEvent(
        trackingId,
        userId,
        "stage_changed",
        `Status: ${PIPELINE_STAGE_LABELS[stage]}`,
        occurredAt,
        null,
        { to: stage },
      ),
    );
  }

  if (INTERVIEW_STAGES.includes(stage) || stage === "offer" || stage === "hired") {
    events.push(
      createTimelineEvent(trackingId, userId, "interview_scheduled", "Entrevista agendada", occurredAt),
    );
  }

  if (stage === "offer" || stage === "hired") {
    events.push(createTimelineEvent(trackingId, userId, "offer_received", "Oferta recebida", occurredAt));
  }

  if (stage === "closed") {
    events.push(createTimelineEvent(trackingId, userId, "rejected", "Processo encerrado", occurredAt));
  }

  return events;
};

const createSeedTracking = (index: number, stage: PipelineStage): JobTrackingEntity => {
  const jobs = jobRepository.findAll();
  const job = jobs[(index - 1) % jobs.length]!;
  const id = `tracking_${String(index).padStart(4, "0")}`;
  const occurredAt = new Date(Date.now() - index * 86_400_000).toISOString();
  const isFavorite = index <= 3;
  const priority: JobPriority = index % 3 === 0 ? "HIGH" : index % 2 === 0 ? "MEDIUM" : "LOW";

  const tracking: JobTrackingEntity = {
    id,
    userId: "user_0001",
    jobId: job.id,
    companyId: job.companyId,
    stage,
    status: "active",
    isFavorite,
    priority,
    visibility: "VISIBLE",
    hiddenAt: null,
    notes: null,
    feedback: null,
    recruiterName: null,
    recruiterRole: null,
    recruiterEmail: null,
    recruiterPhone: null,
    recruiterLinkedin: null,
    tags: [],
    negotiatedSalary: null,
    salaryExpectation: null,
    processLinks: null,
    aiAnalysisStatus: "PENDING",
    aiAnalyzedAt: null,
    nextInterviewAt: null,
    lastStageUpdatedAt: occurredAt,
    job: toJobSnapshot(job, { isFavorite, priority, visibility: "VISIBLE" }),
    timeline: buildSeedTimeline(id, "user_0001", stage, occurredAt),
    createdAt: occurredAt,
    updatedAt: new Date().toISOString(),
  };

  return tracking;
};

export class InMemoryJobTrackingRepository {
  private trackings: JobTrackingEntity[] = PIPELINE_STAGES.flatMap((stage, stageIndex) =>
    Array.from({ length: 2 }, (_, rowIndex) => {
      const index = stageIndex * 2 + rowIndex + 1;
      return createSeedTracking(index, stage);
    }),
  );

  private manualJobs = new Map<string, Job>();

  findAllByUserId(userId: string): JobTrackingEntity[] {
    return this.trackings
      .filter((item) => item.userId === userId && item.status === "active")
      .map((item) => this.enrich(item));
  }

  findById(userId: string, id: string): JobTrackingEntity | null {
    const tracking = this.trackings.find((item) => item.id === id && item.userId === userId);
    return tracking ? this.enrich(tracking) : null;
  }

  private requireTracking(userId: string, id: string): JobTrackingEntity {
    const tracking = this.findById(userId, id);
    if (!tracking) throw new NotFoundError("Tracking not found");
    return tracking;
  }

  findByUserAndJobId(userId: string, jobId: string): JobTrackingEntity | null {
    const tracking = this.trackings.find((item) => item.userId === userId && item.jobId === jobId);
    return tracking ? this.enrich(tracking) : null;
  }

  create(input: CreateTrackingInput): JobTrackingEntity {
    if (input.jobId) {
      const existing = this.findByUserAndJobId(input.userId, input.jobId);
      if (existing) {
        throw new ConflictError("Job already tracked");
      }
    }

    const job = input.jobId ? this.resolveJob(input.userId, input.jobId) : this.createManualJob(input);
    const id = `tracking_${String(trackingCounter++).padStart(4, "0")}`;
    const now = new Date().toISOString();

    const tracking: JobTrackingEntity = {
      id,
      userId: input.userId,
      jobId: job.id,
      companyId: job.companyId,
      stage: input.stage,
      status: "active",
      isFavorite: false,
      priority: "MEDIUM",
      visibility: "VISIBLE",
      hiddenAt: null,
      notes: input.notes ?? null,
      feedback: null,
      recruiterName: null,
      recruiterRole: null,
      recruiterEmail: null,
      recruiterPhone: null,
      recruiterLinkedin: null,
      tags: [],
      negotiatedSalary: null,
      salaryExpectation: null,
      processLinks: null,
      aiAnalysisStatus: "PENDING",
      aiAnalyzedAt: null,
      nextInterviewAt: null,
      lastStageUpdatedAt: input.stageOccurredAt,
      job: toJobSnapshot(job, { isFavorite: false, priority: "MEDIUM", visibility: "VISIBLE" }),
      timeline: [
        createTimelineEvent(id, input.userId, "created", "Processo iniciado", input.stageOccurredAt, input.notes, {
          stage: input.stage,
          source: job.source,
        }),
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.trackings.push(tracking);
    return this.enrich(tracking);
  }

  moveStage(userId: string, id: string, input: MoveTrackingStageInput): JobTrackingEntity {
    const tracking = this.requireTracking(userId, id);

    const fromStage = tracking.stage;
    tracking.stage = input.stage;
    tracking.lastStageUpdatedAt = input.occurredAt;
    tracking.updatedAt = new Date().toISOString();
    tracking.timeline.push(
      createTimelineEvent(
        tracking.id,
        tracking.userId,
        "stage_changed",
        `Status: ${PIPELINE_STAGE_LABELS[input.stage]}`,
        input.occurredAt,
        null,
        { from: fromStage, to: input.stage },
      ),
    );

    return this.enrich(tracking);
  }

  toggleFavorite(userId: string, id: string): JobTrackingEntity {
    const tracking = this.requireTracking(userId, id);

    tracking.isFavorite = !tracking.isFavorite;
    tracking.updatedAt = new Date().toISOString();
    tracking.job.isFavorite = tracking.isFavorite;
    tracking.timeline.push(
      createTimelineEvent(
        tracking.id,
        tracking.userId,
        tracking.isFavorite ? "favorited" : "unfavorited",
        tracking.isFavorite ? "Marcada como favorita" : "Removida dos favoritos",
        new Date().toISOString(),
      ),
    );

    return this.enrich(tracking);
  }

  changePriority(userId: string, id: string, priority: JobPriority): JobTrackingEntity {
    const tracking = this.requireTracking(userId, id);

    const previous = tracking.priority;
    tracking.priority = priority;
    tracking.job.priority = priority;
    tracking.updatedAt = new Date().toISOString();
    tracking.timeline.push(
      createTimelineEvent(
        tracking.id,
        tracking.userId,
        "priority_changed",
        `Prioridade alterada para ${priority}`,
        new Date().toISOString(),
        null,
        { from: previous, to: priority },
      ),
    );

    return this.enrich(tracking);
  }

  setVisibility(userId: string, id: string, visibility: JobVisibility): JobTrackingEntity {
    const tracking = this.requireTracking(userId, id);

    tracking.visibility = visibility;
    tracking.job.visibility = visibility;
    tracking.hiddenAt = visibility === "HIDDEN" ? new Date().toISOString() : null;
    tracking.updatedAt = new Date().toISOString();
    tracking.timeline.push(
      createTimelineEvent(
        tracking.id,
        tracking.userId,
        visibility === "HIDDEN" ? "hidden" : "restored",
        visibility === "HIDDEN" ? "Vaga ocultada" : "Vaga restaurada",
        new Date().toISOString(),
      ),
    );

    return this.enrich(tracking);
  }

  updateNotes(userId: string, id: string, notes: string | null): JobTrackingEntity {
    const tracking = this.requireTracking(userId, id);

    const hadNotes = Boolean(tracking.notes);
    tracking.notes = notes;
    tracking.updatedAt = new Date().toISOString();
    tracking.timeline.push(
      createTimelineEvent(
        tracking.id,
        tracking.userId,
        hadNotes ? "note_updated" : "note_added",
        hadNotes ? "Observações atualizadas" : "Observação adicionada",
        new Date().toISOString(),
        notes,
      ),
    );

    return this.enrich(tracking);
  }

  updateProcess(userId: string, id: string, input: UpdateProcessInput): JobTrackingEntity {
    const tracking = this.requireTracking(userId, id);

    if (input.notes !== undefined && input.notes !== tracking.notes) {
      const hadNotes = Boolean(tracking.notes);
      tracking.notes = input.notes;
      tracking.timeline.push(
        createTimelineEvent(
          tracking.id,
          tracking.userId,
          hadNotes ? "note_updated" : "note_added",
          hadNotes ? "Observações atualizadas" : "Observação adicionada",
          new Date().toISOString(),
          input.notes,
        ),
      );
    }

    if (input.feedback !== undefined) tracking.feedback = input.feedback;
    if (input.recruiterName !== undefined) tracking.recruiterName = input.recruiterName;
    if (input.recruiterRole !== undefined) tracking.recruiterRole = input.recruiterRole;
    if (input.recruiterEmail !== undefined) tracking.recruiterEmail = input.recruiterEmail;
    if (input.recruiterPhone !== undefined) tracking.recruiterPhone = input.recruiterPhone;
    if (input.recruiterLinkedin !== undefined) tracking.recruiterLinkedin = input.recruiterLinkedin;
    if (input.tags !== undefined) tracking.tags = input.tags;
    if (input.salaryExpectation !== undefined) tracking.salaryExpectation = input.salaryExpectation;
    const negotiatedSalary =
      input.offerValue !== undefined ? input.offerValue : input.negotiatedSalary;
    if (negotiatedSalary !== undefined) tracking.negotiatedSalary = negotiatedSalary;
    if (input.processLinks !== undefined) tracking.processLinks = input.processLinks;

    if (input.priority !== undefined && input.priority !== tracking.priority) {
      tracking.priority = input.priority;
      tracking.job.priority = input.priority;
      tracking.timeline.push(
        createTimelineEvent(
          tracking.id,
          tracking.userId,
          "priority_changed",
          `Prioridade alterada para ${input.priority}`,
          new Date().toISOString(),
          null,
          { from: tracking.priority, to: input.priority },
        ),
      );
    }

    if (input.isFavorite !== undefined && input.isFavorite !== tracking.isFavorite) {
      tracking.isFavorite = input.isFavorite;
      tracking.job.isFavorite = input.isFavorite;
      tracking.timeline.push(
        createTimelineEvent(
          tracking.id,
          tracking.userId,
          input.isFavorite ? "favorited" : "unfavorited",
          input.isFavorite ? "Marcada como favorita" : "Removida dos favoritos",
          new Date().toISOString(),
        ),
      );
    }

    tracking.updatedAt = new Date().toISOString();
    return this.enrich(tracking);
  }

  updateTimelineEvent(
    userId: string,
    trackingId: string,
    eventId: string,
    input: UpdateTimelineEventInput,
  ): TrackingTimelineEvent {
    const tracking = this.requireTracking(userId, trackingId);

    const event = tracking.timeline.find((item) => item.id === eventId);
    if (!event) throw new NotFoundError("Timeline event not found");

    if (input.occurredAt) event.occurredAt = input.occurredAt;
    if (input.notes !== undefined) event.notes = input.notes;
    tracking.updatedAt = new Date().toISOString();

    return event;
  }

  archive(userId: string, id: string): JobTrackingEntity {
    const tracking = this.requireTracking(userId, id);
    tracking.status = "archived";
    tracking.updatedAt = new Date().toISOString();
    return this.enrich(tracking);
  }

  delete(userId: string, id: string): void {
    const index = this.trackings.findIndex((item) => item.id === id && item.userId === userId);
    if (index === -1) throw new NotFoundError("Tracking not found");
    this.trackings.splice(index, 1);
  }

  createInterview(
    trackingId: string,
    userId: string,
    input: { scheduledAt: string; link?: string | null; notes?: string | null },
  ) {
    this.requireTracking(userId, trackingId);
    return {
      id: `interview_${trackingId}`,
      trackingId,
      scheduledAt: new Date(input.scheduledAt),
      link: input.link ?? null,
      notes: input.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  listInterviews(trackingId: string, userId: string) {
    this.requireTracking(userId, trackingId);
    return [];
  }

  updateInterview(
    trackingId: string,
    interviewId: string,
    userId: string,
    input: { scheduledAt?: string; link?: string | null; notes?: string | null },
  ) {
    this.requireTracking(userId, trackingId);
    return {
      id: interviewId,
      trackingId,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : new Date(),
      link: input.link ?? null,
      notes: input.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  reset(): void {
    this.trackings = PIPELINE_STAGES.flatMap((stage, stageIndex) =>
      Array.from({ length: 2 }, (_, rowIndex) => {
        const index = stageIndex * 2 + rowIndex + 1;
        return createSeedTracking(index, stage);
      }),
    );
    this.manualJobs.clear();
  }

  private resolveJob(userId: string, jobId: string): Job {
    const job = jobRepository.findById(jobId) ?? this.manualJobs.get(jobId);
    if (!job) throw new NotFoundError("Job not found");
    return job;
  }

  private createManualJob(input: CreateTrackingInput): Job {
    if (!input.job) throw new NotFoundError("Job data required for manual tracking");

    const id = `job_manual_${String(trackingCounter).padStart(4, "0")}`;
    const companyId = `company_manual_${String(trackingCounter).padStart(4, "0")}`;
    const now = new Date().toISOString();
    const job: Job = {
      id,
      title: input.job.title,
      slug: input.job.title.toLowerCase().replace(/\s+/g, "-"),
      companyId,
      company: {
        id: companyId,
        name: input.job.companyName,
        slug: input.job.companyName.toLowerCase().replace(/\s+/g, "-"),
        logoUrl: null,
      },
      area: (input.job.area ?? "frontend") as Job["area"],
      seniority: "mid",
      modality: (input.job.modality ?? "remote") as Job["modality"],
      location: input.job.location ?? "",
      salaryMin: null,
      salaryMax: null,
      currency: "BRL",
      description: input.job.description ?? "",
      requirements: [],
      benefits: [],
      technologies: [],
      source: input.job.source,
      sourceUrl: input.job.sourceUrl ?? "",
      status: "active",
      isFavorite: false,
      engagementState: "new",
      matchScore: { score: 0, label: "low", reasons: [], missingSkills: [] },
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    this.manualJobs.set(id, job);
    jobRepository.addManualJob(job);
    return job;
  }

  private enrich(tracking: JobTrackingEntity): JobTrackingEntity {
    const job = jobRepository.findById(tracking.jobId) ?? this.manualJobs.get(tracking.jobId);
    if (job) {
      tracking.job = toJobSnapshot(job, tracking);
    }
    return { ...tracking, timeline: [...tracking.timeline] };
  }
}

export const inMemoryJobTrackingRepository = new InMemoryJobTrackingRepository();
