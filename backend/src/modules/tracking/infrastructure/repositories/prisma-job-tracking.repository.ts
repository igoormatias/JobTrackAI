import type { Prisma } from "@prisma/client";

import { prisma } from "../../../../database/prisma.js";
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
import { prismaJobRepository } from "../../../jobs/infrastructure/repositories/prisma-job.repository.js";
import type {
  CreateTrackingInput,
  JobTrackingEntity,
  MoveTrackingStageInput,
  TrackingTimelineEvent,
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
  link?: string | null;
  notes?: string | null;
};

export type UpdateInterviewInput = {
  scheduledAt?: string;
  link?: string | null;
  notes?: string | null;
};

export class PrismaJobTrackingRepository {
  async findAllByUserId(userId: string): Promise<JobTrackingEntity[]> {
    const rows = await prisma.jobTracking.findMany({
      where: { userId, status: "active" },
      include: trackingInclude,
      orderBy: { updatedAt: "desc" },
    });
    return rows.map(mapTrackingToEntity);
  }

  async findById(id: string): Promise<JobTrackingEntity | null> {
    const row = await prisma.jobTracking.findUnique({ where: { id }, include: trackingInclude });
    return row ? mapTrackingToEntity(row) : null;
  }

  async findByUserAndJobId(userId: string, jobId: string): Promise<JobTrackingEntity | null> {
    const row = await prisma.jobTracking.findUnique({
      where: { userId_jobId: { userId, jobId } },
      include: trackingInclude,
    });
    return row ? mapTrackingToEntity(row) : null;
  }

  async create(input: CreateTrackingInput): Promise<JobTrackingEntity> {
    if (input.jobId) {
      const existing = await this.findByUserAndJobId(input.userId, input.jobId);
      if (existing) throw new ConflictError("Job already tracked");
    }

    let jobId = input.jobId;
    if (!jobId && input.job) {
      const job = await prismaJobRepository.createManualJob(input.userId, input.job);
      jobId = job.id;
    }
    if (!jobId) throw new NotFoundError("Job data required");

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Job not found");

    const occurredAt = new Date(input.stageOccurredAt);
    const row = await prisma.jobTracking.create({
      data: {
        userId: input.userId,
        jobId,
        stage: input.stage,
        notes: input.notes ?? null,
        lastStageUpdatedAt: occurredAt,
        timelineEvents: {
          create: {
            type: "created",
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

    const entity = mapTrackingToEntity(row);
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

  async moveStage(id: string, input: MoveTrackingStageInput): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findUnique({ where: { id }, include: { job: true } });
    if (!current) throw new NotFoundError("Tracking not found");

    const fromStage = current.stage;
    const occurredAt = new Date(input.occurredAt);

    const row = await prisma.jobTracking.update({
      where: { id },
      data: {
        stage: input.stage,
        lastStageUpdatedAt: occurredAt,
        timelineEvents: {
          create: {
            type: "stage_changed",
            title: stageTitle(input.stage),
            occurredAt,
            metadata: { from: fromStage, to: input.stage },
            createdById: current.userId,
          },
        },
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

    return mapTrackingToEntity(row);
  }

  async toggleFavorite(id: string): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findUnique({ where: { id }, include: { job: true } });
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

    return mapTrackingToEntity(row);
  }

  async changePriority(id: string, priority: JobPriority): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findUnique({ where: { id }, include: { job: true } });
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

    return mapTrackingToEntity(row);
  }

  async setVisibility(id: string, visibility: JobVisibility): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findUnique({ where: { id } });
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

    return mapTrackingToEntity(row);
  }

  async updateNotes(id: string, notes: string | null): Promise<JobTrackingEntity> {
    const current = await prisma.jobTracking.findUnique({ where: { id } });
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

    return mapTrackingToEntity(row);
  }

  async updateTimelineEvent(
    trackingId: string,
    eventId: string,
    input: UpdateTimelineEventInput,
  ): Promise<TrackingTimelineEvent> {
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

  async archive(id: string): Promise<JobTrackingEntity> {
    const row = await prisma.jobTracking.update({
      where: { id },
      data: { status: "archived" },
      include: trackingInclude,
    });
    return mapTrackingToEntity(row);
  }

  async delete(id: string): Promise<void> {
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
        link: input.link ?? null,
        notes: input.notes ?? null,
      },
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

    const interview = await prisma.interview.findFirst({ where: { id: interviewId, trackingId } });
    if (!interview) throw new NotFoundError("Interview not found");

    return prisma.interview.update({
      where: { id: interviewId },
      data: {
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        link: input.link,
        notes: input.notes,
      },
    });
  }
}

export const prismaJobTrackingRepository = new PrismaJobTrackingRepository();
