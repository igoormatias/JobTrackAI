import { logger } from "../../../../config/logger.js";
import { emitToUser } from "../../../../config/socket.js";
import type { DomainEvent } from "../../../../shared/domain/domain-event.js";
import type { EventBus } from "../../../../shared/events/event-bus.interface.js";
import { buildCareerAnalysisService } from "../../../ai/infrastructure/http/routes/ai.routes.js";
import { prisma } from "../../../../database/prisma.js";
import { ProcessCreatedEvent } from "../../../notifications/domain/events/notification-events.js";

const ANALYSIS_REALTIME_EVENT = "tracking:analysis-update";

export class TrackingAnalysisBackgroundHandler {
  register(eventBus: EventBus): void {
    eventBus.subscribe("process_created", (event) => this.onProcessCreated(event));
  }

  private async onProcessCreated(event: DomainEvent): Promise<void> {
    if (!(event instanceof ProcessCreatedEvent)) return;

    const { userId, trackingId } = event.payload;

    setImmediate(() => {
      void this.runBackgroundAnalysis(userId, trackingId);
    });
  }

  private async runBackgroundAnalysis(userId: string, trackingId: string): Promise<void> {
    try {
      await prisma.jobTracking.update({
        where: { id: trackingId },
        data: { aiAnalysisStatus: "PROCESSING" },
      });
      emitToUser(userId, ANALYSIS_REALTIME_EVENT, { trackingId, status: "PROCESSING" });

      const service = buildCareerAnalysisService();
      const result = await service.generate(userId, trackingId, false);

      const tracking = await prisma.jobTracking.findUnique({
        where: { id: trackingId },
        select: { rulesMatchScore: true },
      });

      await prisma.jobTracking.update({
        where: { id: trackingId },
        data: {
          aiAnalysisStatus: result.cached ? "CACHED" : "COMPLETED",
          aiMatchScore: tracking?.rulesMatchScore ?? null,
          aiAnalyzedAt: new Date(),
        },
      });

      emitToUser(userId, ANALYSIS_REALTIME_EVENT, {
        trackingId,
        status: result.cached ? "CACHED" : "COMPLETED",
      });
      emitToUser(userId, "pipeline:update", { trackingId });
      emitToUser(userId, "dashboard:update", { trackingId });

      logger.info({ userId, trackingId, cached: result.cached }, "Background career analysis completed");
    } catch (error) {
      logger.error({ userId, trackingId, error }, "Background career analysis failed");
      await prisma.jobTracking
        .update({
          where: { id: trackingId },
          data: { aiAnalysisStatus: "FAILED" },
        })
        .catch(() => undefined);
      emitToUser(userId, ANALYSIS_REALTIME_EVENT, { trackingId, status: "FAILED" });
    }
  }
}

export const trackingAnalysisBackgroundHandler = new TrackingAnalysisBackgroundHandler();
