import { prisma } from "../../../../database/prisma.js";
import { decryptToken } from "../../../../shared/utils/token-crypto.utils.js";
import type { CalendarProviderPort } from "../../domain/ports/calendar-provider.port.js";
import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";

export class ListCalendarEventsUseCase {
  constructor(
    private readonly repository: CalendarIntegrationRepository,
    private readonly provider: CalendarProviderPort,
  ) {}

  async execute(userId: string, from: Date, to: Date) {
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

    const localEvents = localInterviews.map((interview) => ({
      id: `interview_${interview.id}`,
      summary: `Entrevista · ${interview.tracking.job.title}`,
      description: interview.notes ?? null,
      location: interview.location ?? null,
      htmlLink: interview.link ?? null,
      start: interview.scheduledAt.toISOString(),
      end: new Date(interview.scheduledAt.getTime() + 60 * 60 * 1000).toISOString(),
      source: "interview" as const,
    }));

    const integration = await this.repository.findActiveByUserId(userId);
    if (!integration?.calendarId) {
      return { events: localEvents };
    }

    const tokens = {
      accessToken: decryptToken(integration.accessToken),
      refreshToken: decryptToken(integration.refreshToken),
      tokenExpiry: integration.tokenExpiry,
    };

    const googleEvents = await this.provider.listEvents(
      integration.calendarId,
      from,
      to,
      tokens,
      async (accessToken, tokenExpiry) => {
        await this.repository.updateTokens(userId, accessToken, tokenExpiry);
      },
    );

    const remoteEvents = googleEvents.map((event) => ({
      id: event.id,
      summary: event.summary,
      description: event.description ?? null,
      location: event.location ?? null,
      htmlLink: event.htmlLink ?? null,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      source: "google" as const,
    }));

    const merged = [...localEvents, ...remoteEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    return { events: merged };
  }
}
