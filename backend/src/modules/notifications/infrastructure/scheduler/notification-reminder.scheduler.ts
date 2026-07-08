import { prisma } from "../../../../database/prisma.js";
import { logger } from "../../../../config/logger.js";
import type { EventBus } from "../../../../shared/events/event-bus.interface.js";
import { FollowupReminderEvent, InterviewReminderEvent } from "../../domain/events/notification-events.js";

const REMINDER_WINDOWS = [
  { kind: "24h" as const, targetMinutes: 24 * 60, toleranceMinutes: 5 },
  { kind: "30min" as const, targetMinutes: 30, toleranceMinutes: 5 },
];

const FOLLOWUP_IDLE_DAYS = 7;
const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const ACTIVE_PIPELINE_STAGES = [
  "applied",
  "hr",
  "technical_interview",
  "manager",
  "client",
  "technical_test",
  "offer",
];

export class NotificationReminderScheduler {
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly eventBus: EventBus) {}

  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      void this.checkReminders().catch((error) => {
        logger.error({ error }, "Interview reminder check failed");
      });
      void this.checkFollowups().catch((error) => {
        logger.error({ error }, "Follow-up reminder check failed");
      });
    }, CHECK_INTERVAL_MS);

    logger.info({ intervalMs: CHECK_INTERVAL_MS }, "Notification reminder scheduler started");
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  async checkReminders(): Promise<number> {
    const now = Date.now();
    let sent = 0;

    for (const window of REMINDER_WINDOWS) {
      const targetMs = window.targetMinutes * 60 * 1000;
      const toleranceMs = window.toleranceMinutes * 60 * 1000;
      const rangeStart = new Date(now + targetMs - toleranceMs);
      const rangeEnd = new Date(now + targetMs + toleranceMs);

      const interviews = await prisma.interview.findMany({
        where: {
          scheduledAt: {
            gte: rangeStart,
            lte: rangeEnd,
          },
        },
        include: {
          tracking: {
            include: {
              job: {
                select: { title: true, companyName: true },
              },
            },
          },
        },
      });

      for (const interview of interviews) {
        const userId = interview.tracking.userId;
        const alreadySent = await prisma.notification.findFirst({
          where: {
            userId,
            type: "interview_reminder",
            deletedAt: null,
            metadata: {
              path: ["interviewId"],
              equals: interview.id,
            },
            AND: {
              metadata: {
                path: ["reminderKind"],
                equals: window.kind,
              },
            },
          },
          select: { id: true },
        });

        if (alreadySent) continue;

        await this.eventBus.publish(
          new InterviewReminderEvent({
            userId,
            trackingId: interview.trackingId,
            interviewId: interview.id,
            jobTitle: interview.tracking.job.title,
            companyName: interview.tracking.job.companyName,
            scheduledAt: interview.scheduledAt.toISOString(),
            reminderKind: window.kind,
          }),
        );

        sent += 1;
      }
    }

    if (sent > 0) {
      logger.info({ sent }, "Interview reminder events published");
    }

    return sent;
  }

  async checkFollowups(): Promise<number> {
    const idleBefore = new Date(Date.now() - FOLLOWUP_IDLE_DAYS * 24 * 60 * 60 * 1000);

    const trackings = await prisma.jobTracking.findMany({
      where: {
        stage: { in: ACTIVE_PIPELINE_STAGES },
        status: "active",
        OR: [
          { lastStageUpdatedAt: { lte: idleBefore } },
          { lastStageUpdatedAt: null, updatedAt: { lte: idleBefore } },
        ],
      },
      include: {
        job: { select: { title: true, companyName: true } },
      },
      take: 100,
    });

    let sent = 0;

    for (const tracking of trackings) {
      const alreadySent = await prisma.notification.findFirst({
        where: {
          userId: tracking.userId,
          type: "followup_reminder",
          deletedAt: null,
          createdAt: { gte: idleBefore },
          metadata: {
            path: ["trackingId"],
            equals: tracking.id,
          },
        },
        select: { id: true },
      });

      if (alreadySent) continue;

      const referenceDate = tracking.lastStageUpdatedAt ?? tracking.updatedAt;
      const daysIdle = Math.max(
        FOLLOWUP_IDLE_DAYS,
        Math.floor((Date.now() - referenceDate.getTime()) / (24 * 60 * 60 * 1000)),
      );

      await this.eventBus.publish(
        new FollowupReminderEvent({
          userId: tracking.userId,
          trackingId: tracking.id,
          jobTitle: tracking.job.title,
          companyName: tracking.job.companyName,
          stage: tracking.stage,
          daysIdle,
        }),
      );

      sent += 1;
    }

    if (sent > 0) {
      logger.info({ sent }, "Follow-up reminder events published");
    }

    return sent;
  }
}
