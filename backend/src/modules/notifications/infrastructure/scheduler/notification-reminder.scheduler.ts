import { prisma } from "../../../../database/prisma.js";
import { logger } from "../../../../config/logger.js";
import type { EventBus } from "../../../../shared/events/event-bus.interface.js";
import { InterviewReminderEvent } from "../../domain/events/notification-events.js";

const REMINDER_WINDOWS = [
  { kind: "24h" as const, targetMinutes: 24 * 60, toleranceMinutes: 5 },
  { kind: "30min" as const, targetMinutes: 30, toleranceMinutes: 5 },
];

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export class NotificationReminderScheduler {
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly eventBus: EventBus) {}

  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      void this.checkReminders().catch((error) => {
        logger.error({ error }, "Interview reminder check failed");
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
}
