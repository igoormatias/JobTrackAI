import { prisma } from "../../../../database/prisma.js";
import { logger } from "../../../../config/logger.js";
import { PIPELINE_STAGE_LABELS, type PipelineStage } from "../../../../shared/domain/pipeline-stage.js";
import type { CalendarProviderPort } from "../../domain/ports/calendar-provider.port.js";
import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";
import { CalendarTokenService } from "./calendar-token.service.js";

export type CareerEventSource = "interview" | "google";

export type CareerEvent = {
  id: string;
  summary: string;
  description: string | null;
  location: string | null;
  htmlLink: string | null;
  start: string;
  end: string;
  source: CareerEventSource;
  trackingId?: string;
  jobTitle?: string;
  companyName?: string;
  stage?: string;
  meetingType?: string | null;
  calendarEventId?: string | null;
};

export type ListCareerEventsOptions = {
  degradeOnProviderFailure?: boolean;
};

export class CareerEventsService {
  private readonly tokenService: CalendarTokenService;

  constructor(
    private readonly repository: CalendarIntegrationRepository,
    private readonly provider: CalendarProviderPort,
  ) {
    this.tokenService = new CalendarTokenService(repository, provider);
  }

  async listEvents(
    userId: string,
    from: Date,
    to: Date,
    options?: ListCareerEventsOptions,
  ): Promise<CareerEvent[]> {
    const localInterviews = await prisma.interview.findMany({
      where: {
        tracking: { userId },
        scheduledAt: { gte: from, lte: to },
      },
      include: {
        tracking: { include: { job: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    const googleEventIds = new Set(
      localInterviews
        .map((interview) => interview.calendarEventId)
        .filter((id): id is string => Boolean(id)),
    );

    const localEvents: CareerEvent[] = localInterviews.map((interview) => {
      const stage = interview.tracking.stage;
      const stageLabel =
        PIPELINE_STAGE_LABELS[stage as PipelineStage] ?? stage;

      return {
        id: `interview_${interview.id}`,
        summary: `Entrevista · ${interview.tracking.job.title}`,
        description: interview.notes ?? null,
        location: interview.location ?? null,
        htmlLink: interview.link ?? null,
        start: interview.scheduledAt.toISOString(),
        end: new Date(interview.scheduledAt.getTime() + 60 * 60 * 1000).toISOString(),
        source: "interview",
        trackingId: interview.trackingId,
        jobTitle: interview.tracking.job.title,
        companyName: interview.tracking.job.companyName,
        stage: stageLabel,
        meetingType: interview.meetingType,
        calendarEventId: interview.calendarEventId,
      };
    });

    try {
      const fresh = await this.tokenService.getFreshTokens(userId);
      if (!fresh) {
        return localEvents;
      }

      const googleEvents = await this.provider.listEvents(
        fresh.calendarId,
        from,
        to,
        fresh.tokens,
        this.tokenService.createRefreshCallback(userId),
      );

      const remoteEvents: CareerEvent[] = googleEvents
        .filter((event) => !googleEventIds.has(event.id))
        .map((event) => ({
          id: event.id,
          summary: event.summary,
          description: event.description ?? null,
          location: event.location ?? null,
          htmlLink: event.htmlLink ?? null,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
          source: "google",
        }));

      return [...localEvents, ...remoteEvents].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
    } catch (error) {
      if (!options?.degradeOnProviderFailure) {
        throw error;
      }

      logger.error(
        {
          err: error,
          userId,
          method: "CareerEventsService.listEvents",
        },
        "Google Calendar enrichment failed; returning local interviews only",
      );
      return localEvents;
    }
  }

  async getUpcomingEvents(userId: string, limit = 5): Promise<CareerEvent[]> {
    const now = new Date();
    const horizon = new Date(now.getTime() + 90 * 86_400_000);
    const events = await this.listEvents(userId, now, horizon);
    return events.filter((event) => new Date(event.start) >= now).slice(0, limit);
  }
}
