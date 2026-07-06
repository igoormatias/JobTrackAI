import type { Prisma } from "@prisma/client";

import { logger } from "../../../../config/logger.js";
import { prisma } from "../../../../database/prisma.js";
import { syncInterviewCalendarEventUseCase } from "../../../calendar/application/use-cases/sync-interview-calendar-event.instance.js";
import type { JobPriority } from "../../../../shared/domain/job-priority.js";
import type { JobVisibility } from "../../../../shared/domain/job-visibility.js";
import { eventBus } from "../../../../shared/events/event-bus.js";
import { ConflictError } from "../../../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import {
  InterviewReminderEvent,
  JobFavoritedEvent,
  PriorityChangedEvent,
  ProcessCreatedEvent,
  StatusChangedEvent,
} from "../../../notifications/domain/events/notification-events.js";
import { loadMatchProfileForUser } from "../../../job-catalog/application/mappers/match-profile.mapper.js";
import { matchEngineService } from "../../../match/domain/services/match-engine.service.js";
import { toMatchJobInput } from "../../../jobs/infrastructure/mappers/job.mapper.js";
import { manualJobToCatalogInput } from "../../../job-catalog/infrastructure/mappers/manual-job-to-catalog.mapper.js";
import { prismaJobCatalogRepository } from "../../../job-catalog/infrastructure/repositories/prisma-job-catalog.repository.js";
import type {
  CreateTrackingInput,
  JobTrackingEntity,
  MoveTrackingStageInput,
  TrackingTimelineEvent,
  UpdateProcessInput,
  UpdateTimelineEventInput,
} from "../../domain/entities/job-tracking.entity.js";
import { mapTrackingToEntity, stageTitle } from "../mappers/tracking.mapper.js";

const trackingInclude = {
  job: true,
  timelineEvents: { orderBy: { occurredAt: "asc" as const } },
  interviews: { orderBy: { scheduledAt: "asc" as const } },
};

export type CreateInterviewInput = {
  scheduledAt: string;
  timezone?: string | null;
  location?: string | null;
  meetingType?: string | null;
  link?: string | null;
  notes?: string | null;
};

export type UpdateInterviewInput = {
  scheduledAt?: string;
  timezone?: string | null;
  location?: string | null;
  meetingType?: string | null;
  link?: string | null;
  notes?: string | null;
};

export class PrismaJobTrackingRepository {
  private async mapRow(
    userId: string,
    row: Parameters<typeof mapTrackingToEntity>[0],
  ): Promise<JobTrackingEntity> {
    const profile = await loadMatchProfileForUser(userId);
    return mapTrackingToEntity(row, profile);
  }

  private async mapRows(
    userId: string,
    rows: Parameters<typeof mapTrackingToEntity>[0][],
  ): Promise<JobTrackingEntity[]> {
    const profile = await loadMatchProfileForUser(userId);
    return rows.map((row) => mapTrackingToEntity(row, profile));
  }

  async findAllByUserId(userId: string): Promise<JobTrackingEntity[]> {
    const rows = await prisma.jobTracking.findMany({
      where: { userId, status: "active" },
      include: trackingInclude,
      orderBy: { updatedAt: "desc" },
    });
    return this.mapRows(userId, rows);
  }

  async findById(userId: string, id: string): Promise<JobTrackingEntity | null> {
    const row = await prisma.jobTracking.findFirst({
      where: { id, userId },
      include: trackingInclude,
    });
    return row ? this.mapRow(userId, row) : null;
  }

  async findByUserAndJobId(userId: string, jobId: string): Promise<JobTrackingEntity | null> {
    const row = await prisma.jobTracking.findUnique({
      where: { userId_jobId: { userId, jobId } },
      include: trackingInclude,
    });
    return row ? this.mapRow(userId, row) : null;
  }

  async create(input: CreateTrackingInput): Promise<JobTrackingEntity> {
    if (input.jobId) {
      const existing = await this.findByUserAndJobId(input.userId, input.jobId);
      if (existing) throw new ConflictError("Job already tracked");
    }

    let jobId = input.jobId;
    if (!jobId && input.job) {
      const catalogInput = manualJobToCatalogInput(input.job);
      const catalogJob = await prismaJobCatalogRepository.upsertCatalogJob(catalogInput);
      jobId = catalogJob.id;
    }
    if (!jobId) throw new NotFoundError("Job data required");

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Job not found");

    const profile = await loadMatchProfileForUser(input.userId);
    const rulesMatch = profile ? matchEngineService.compute(profile, toMatchJobInput(job)) : null;

    const occurredAt = new Date(input.stageOccurredAt);
    const row = await prisma.jobTracking.create({
      data: {
        userId: input.userId,
        jobId,
        stage: input.stage,
        notes: input.notes ?? null,
        lastStageUpdatedAt: occurredAt,
        rulesMatchScore: rulesMatch?.score ?? null,
        rulesMatchLabel: rulesMatch?.label ?? null,
        rulesMatchReasons: rulesMatch?.reasons ?? undefined,
        aiAnalysisStatus: "PENDING",
        jobContentHash: job.contentHash,
        timelineEvents: {
          create: {
            type: "process_created",
            title: "Processo iniciado",
            occurredAt,
            notes: input.notes ?? null,
            metadata: { stage: input.stage, source: job.source },
            createdById: input.userId,
          },
        },
      },
      include: trackingInclude,
    });

    const entity = await this.mapRow(input.userId, row);
    await eventBus.publish(
      new ProcessCreatedEvent({
        userId: input.userId,
        trackingId: entity.id,
        jobTitle: job.title,
        companyName: job.companyName,
      }),
    );
    return entity;
  }

  async moveStage(userId: string, id: string, input: MoveTrackingStageInput): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findFirst({
      where: { id, userId },
      include: { job: true },
    });
    if (!current) throw new NotFoundError("Tracking not found");

    const fromStage = current.stage;
    const occurredAt = new Date(input.occurredAt);

    const stageTimelineCreates: Prisma.TimelineEventCreateWithoutTrackingInput[] = [
      {
        type: "stage_changed",
        title: stageTitle(input.stage),
        occurredAt,
        metadata: { from: fromStage, to: input.stage },
        createdById: current.userId,
      },
    ];

    if (input.stage === "offer") {
      stageTimelineCreates.push({
        type: "offer",
        title: "Oferta recebida",
        occurredAt,
        createdById: current.userId,
      });
    }

    if (input.stage === "closed") {
      stageTimelineCreates.push({
        type: "rejected",
        title: "Processo encerrado",
        occurredAt,
        createdById: current.userId,
      });
    }

    const row = await prisma.jobTracking.update({
      where: { id },
      data: {
        stage: input.stage,
        lastStageUpdatedAt: occurredAt,
        timelineEvents: { create: stageTimelineCreates },
      },
      include: trackingInclude,
    });

    await eventBus.publish(
      new StatusChangedEvent({
        userId: current.userId,
        trackingId: id,
        jobTitle: current.job.title,
        companyName: current.job.companyName,
        fromStage,
        toStage: input.stage,
      }),
    );

    return this.mapRow(userId, row);
  }

  async toggleFavorite(userId: string, id: string): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findFirst({
      where: { id, userId },
      include: { job: true },
    });
    if (!current) throw new NotFoundError("Tracking not found");

    const isFavorite = !current.isFavorite;
    const row = await prisma.jobTracking.update({
      where: { id },
      data: {
        isFavorite,
        timelineEvents: {
          create: {
            type: isFavorite ? "favorited" : "unfavorited",
            title: isFavorite ? "Marcada como favorita" : "Removida dos favoritos",
            occurredAt: new Date(),
            createdById: current.userId,
          },
        },
      },
      include: trackingInclude,
    });

    await eventBus.publish(
      new JobFavoritedEvent({
        userId: current.userId,
        trackingId: id,
        jobTitle: current.job.title,
        companyName: current.job.companyName,
        isFavorite,
      }),
    );

    return this.mapRow(userId, row);
  }

  async changePriority(userId: string, id: string, priority: JobPriority): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findFirst({
      where: { id, userId },
      include: { job: true },
    });
    if (!current) throw new NotFoundError("Tracking not found");

    const row = await prisma.jobTracking.update({
      where: { id },
      data: {
        priority,
        timelineEvents: {
          create: {
            type: "priority_changed",
            title: `Prioridade alterada para ${priority}`,
            occurredAt: new Date(),
            metadata: { from: current.priority, to: priority },
            createdById: current.userId,
          },
        },
      },
      include: trackingInclude,
    });

    await eventBus.publish(
      new PriorityChangedEvent({
        userId: current.userId,
        trackingId: id,
        jobTitle: current.job.title,
        companyName: current.job.companyName,
        priority,
      }),
    );

    return this.mapRow(userId, row);
  }

  async setVisibility(userId: string, id: string, visibility: JobVisibility): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findFirst({ where: { id, userId } });
    if (!current) throw new NotFoundError("Tracking not found");

    const row = await prisma.jobTracking.update({
      where: { id },
      data: {
        visibility,
        hiddenAt: visibility === "HIDDEN" ? new Date() : null,
        timelineEvents: {
          create: {
            type: visibility === "HIDDEN" ? "hidden" : "restored",
            title: visibility === "HIDDEN" ? "Vaga ocultada" : "Vaga restaurada",
            occurredAt: new Date(),
            createdById: current.userId,
          },
        },
      },
      include: trackingInclude,
    });

    return this.mapRow(userId, row);
  }

  async updateNotes(userId: string, id: string, notes: string | null): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findFirst({ where: { id, userId } });
    if (!current) throw new NotFoundError("Tracking not found");

    const hadNotes = Boolean(current.notes);
    const row = await prisma.jobTracking.update({
      where: { id },
      data: {
        notes,
        timelineEvents: {
          create: {
            type: hadNotes ? "note_updated" : "note_added",
            title: hadNotes ? "Observações atualizadas" : "Observação adicionada",
            occurredAt: new Date(),
            notes,
            createdById: current.userId,
          },
        },
      },
      include: trackingInclude,
    });

    return this.mapRow(userId, row);
  }

  async updateProcess(userId: string, id: string, input: UpdateProcessInput): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findFirst({ where: { id, userId } });
    if (!current) throw new NotFoundError("Tracking not found");

    const data: Prisma.JobTrackingUpdateInput = {};
    const timelineCreates: Prisma.TimelineEventCreateWithoutTrackingInput[] = [];

    if (input.notes !== undefined && input.notes !== current.notes) {
      data.notes = input.notes;
      timelineCreates.push({
        type: current.notes ? "note_updated" : "note_added",
        title: current.notes ? "Observações atualizadas" : "Observação adicionada",
        occurredAt: new Date(),
        notes: input.notes,
        createdById: userId,
      });
    }

    if (input.feedback !== undefined) data.feedback = input.feedback;
    if (input.recruiterName !== undefined) data.recruiterName = input.recruiterName;
    if (input.recruiterEmail !== undefined) data.recruiterEmail = input.recruiterEmail || null;
    if (input.recruiterPhone !== undefined) data.recruiterPhone = input.recruiterPhone;
    if (input.recruiterLinkedin !== undefined) data.recruiterLinkedin = input.recruiterLinkedin || null;
    if (input.tags !== undefined) data.tags = input.tags;
    if (input.salaryExpectation !== undefined) {
      data.salaryExpectation = input.salaryExpectation ?? undefined;
    }

    const negotiatedSalary =
      input.offerValue !== undefined ? input.offerValue : input.negotiatedSalary;
    if (negotiatedSalary !== undefined) data.negotiatedSalary = negotiatedSalary;
    if (input.processLinks !== undefined) data.processLinks = input.processLinks ?? undefined;

    if (input.priority !== undefined && input.priority !== current.priority) {
      data.priority = input.priority;
      timelineCreates.push({
        type: "priority_changed",
        title: `Prioridade alterada para ${input.priority}`,
        occurredAt: new Date(),
        metadata: { from: current.priority, to: input.priority },
        createdById: userId,
      });
    }

    if (input.isFavorite !== undefined && input.isFavorite !== current.isFavorite) {
      data.isFavorite = input.isFavorite;
      timelineCreates.push({
        type: input.isFavorite ? "favorited" : "unfavorited",
        title: input.isFavorite ? "Marcada como favorita" : "Removida dos favoritos",
        occurredAt: new Date(),
        createdById: userId,
      });
    }

    if (timelineCreates.length > 0) {
      data.timelineEvents = { create: timelineCreates };
    }

    const row = await prisma.jobTracking.update({
      where: { id },
      data,
      include: trackingInclude,
    });

    return this.mapRow(userId, row);
  }

  async updateTimelineEvent(
    userId: string,
    trackingId: string,
    eventId: string,
    input: UpdateTimelineEventInput,
  ): Promise<TrackingTimelineEvent> {
    const tracking = await prisma.jobTracking.findFirst({ where: { id: trackingId, userId } });
    if (!tracking) throw new NotFoundError("Tracking not found");

    const event = await prisma.timelineEvent.findFirst({ where: { id: eventId, trackingId } });
    if (!event) throw new NotFoundError("Timeline event not found");

    const data: Prisma.TimelineEventUpdateInput = {};
    if (input.occurredAt) data.occurredAt = new Date(input.occurredAt);
    if (input.notes !== undefined) data.notes = input.notes;

    const updated = await prisma.timelineEvent.update({ where: { id: eventId }, data });
    await prisma.jobTracking.update({ where: { id: trackingId }, data: { updatedAt: new Date() } });

    return {
      id: updated.id,
      trackingId: updated.trackingId,
      type: updated.type as TrackingTimelineEvent["type"],
      title: updated.title,
      occurredAt: updated.occurredAt.toISOString(),
      notes: updated.notes,
      metadata: (updated.metadata as Record<string, unknown> | null) ?? null,
      createdById: updated.createdById,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async archive(userId: string, id: string): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findFirst({ where: { id, userId } });
    if (!current) throw new NotFoundError("Tracking not found");

    const row = await prisma.jobTracking.update({
      where: { id },
      data: { status: "archived" },
      include: trackingInclude,
    });
    return this.mapRow(userId, row);
  }

  async delete(userId: string, id: string): Promise<void> {
    const current = await prisma.jobTracking.findFirst({ where: { id, userId } });
    if (!current) throw new NotFoundError("Tracking not found");

    await prisma.jobTracking.delete({ where: { id } });
  }

  async createInterview(trackingId: string, userId: string, input: CreateInterviewInput) {
    const tracking = await prisma.jobTracking.findFirst({
      where: { id: trackingId, userId },
      include: { job: true },
    });
    if (!tracking) throw new NotFoundError("Tracking not found");

    const scheduledAt = new Date(input.scheduledAt);
    const interview = await prisma.interview.create({
      data: {
        trackingId,
        scheduledAt,
        timezone: input.timezone ?? null,
        location: input.location ?? null,
        meetingType: input.meetingType ?? null,
        link: input.link ?? null,
        notes: input.notes ?? null,
      },
    });

    await prisma.jobTracking.update({
      where: { id: trackingId },
      data: { nextInterviewAt: scheduledAt, updatedAt: new Date() },
    });

    await prisma.timelineEvent.create({
      data: {
        trackingId,
        type: "interview_scheduled",
        title: "Entrevista agendada",
        occurredAt: scheduledAt,
        notes: input.notes ?? null,
        metadata: { interviewId: interview.id, link: input.link },
        createdById: userId,
      },
    });

    const hoursUntil = (scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil <= 48 && hoursUntil > 0) {
      await eventBus.publish(
        new InterviewReminderEvent({
          userId,
          trackingId,
          interviewId: interview.id,
          jobTitle: tracking.job.title,
          companyName: tracking.job.companyName,
          scheduledAt: scheduledAt.toISOString(),
        }),
      );
    }

    void syncInterviewCalendarEventUseCase
      .execute({
        userId,
        interviewId: interview.id,
        trackingId,
        scheduledAt: scheduledAt.toISOString(),
        link: input.link,
        notes: input.notes,
        jobTitle: tracking.job.title,
        companyName: tracking.job.companyName,
        calendarEventId: interview.calendarEventId,
      })
      .catch((err) => logger.error({ err, interviewId: interview.id }, "Calendar sync failed"));

    return interview;
  }

  async listInterviews(trackingId: string, userId: string) {
    const tracking = await prisma.jobTracking.findFirst({ where: { id: trackingId, userId } });
    if (!tracking) throw new NotFoundError("Tracking not found");
    return prisma.interview.findMany({ where: { trackingId }, orderBy: { scheduledAt: "asc" } });
  }

  async updateInterview(
    trackingId: string,
    interviewId: string,
    userId: string,
    input: UpdateInterviewInput,
  ) {
    const tracking = await prisma.jobTracking.findFirst({ where: { id: trackingId, userId } });
    if (!tracking) throw new NotFoundError("Tracking not found");

    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, trackingId },
      include: { tracking: { include: { job: true } } },
    });
    if (!interview) throw new NotFoundError("Interview not found");

    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        link: input.link,
        notes: input.notes,
      },
    });

    const scheduledAt = input.scheduledAt ?? interview.scheduledAt.toISOString();
    void syncInterviewCalendarEventUseCase
      .execute({
        userId,
        interviewId: updated.id,
        trackingId,
        scheduledAt,
        link: input.link !== undefined ? input.link : interview.link,
        notes: input.notes !== undefined ? input.notes : interview.notes,
        jobTitle: interview.tracking.job.title,
        companyName: interview.tracking.job.companyName,
        calendarEventId: interview.calendarEventId,
      })
      .catch((err) => logger.error({ err, interviewId: updated.id }, "Calendar sync failed"));

    return updated;
  }
}

export const prismaJobTrackingRepository = new PrismaJobTrackingRepository();
