import { prisma } from "../../../database/prisma.js";
import { logger } from "../../../config/logger.js";
import type { EventBus } from "../../../shared/events/event-bus.interface.js";
import { JobClosedEvent } from "../domain/events/notification-events.js";
import type { NotificationService } from "./notification.service.js";

export class JobSyncNotificationService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly eventBus?: EventBus,
  ) {}

  async notifyClosedJobs(closedJobIds: string[]): Promise<number> {
    if (closedJobIds.length === 0) return 0;

    const jobs = await prisma.job.findMany({
      where: { id: { in: closedJobIds } },
      select: {
        id: true,
        title: true,
        companyName: true,
        source: true,
        trackings: {
          select: { id: true, userId: true },
        },
      },
    });

    let notified = 0;

    for (const job of jobs) {
      for (const tracking of job.trackings) {
        await this.notificationService.create({
          userId: tracking.userId,
          type: "job_closed",
          title: "Vaga encerrada",
          message: `${job.title} · ${job.companyName} não está mais disponível na origem.`,
          actionUrl: `/jobs/${job.id}`,
          metadata: {
            jobId: job.id,
            trackingId: tracking.id,
            source: job.source,
          },
        });

        if (this.eventBus) {
          await this.eventBus.publish(
            new JobClosedEvent({
              userId: tracking.userId,
              jobId: job.id,
              trackingId: tracking.id,
              jobTitle: job.title,
              companyName: job.companyName,
            }),
          );
        }

        notified += 1;
      }
    }

    if (notified > 0) {
      logger.info({ closedJobIds: closedJobIds.length, notified }, "Job closed notifications sent");
    }

    return notified;
  }
}
