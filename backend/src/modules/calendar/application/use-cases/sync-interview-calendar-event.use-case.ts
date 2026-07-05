import { prisma } from "../../../../database/prisma.js";
import type { CalendarProviderPort } from "../../domain/ports/calendar-provider.port.js";
import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";
import { CalendarTokenService } from "../services/calendar-token.service.js";

export type SyncInterviewCalendarEventInput = {
  userId: string;
  interviewId: string;
  trackingId: string;
  scheduledAt: string;
  link?: string | null;
  notes?: string | null;
  jobTitle: string;
  companyName: string;
  calendarEventId?: string | null;
};

const buildEventInput = (input: SyncInterviewCalendarEventInput) => {
  const start = new Date(input.scheduledAt);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const description = [input.notes, input.link ? `Link: ${input.link}` : null]
    .filter(Boolean)
    .join("\n\n");

  return {
    summary: `Entrevista: ${input.jobTitle} @ ${input.companyName}`,
    description: description || undefined,
    start,
    end,
    location: input.link ?? undefined,
  };
};

export class SyncInterviewCalendarEventUseCase {
  private readonly tokenService: CalendarTokenService;

  constructor(
    private readonly repository: CalendarIntegrationRepository,
    private readonly provider: CalendarProviderPort,
  ) {
    this.tokenService = new CalendarTokenService(repository, provider);
  }

  async execute(input: SyncInterviewCalendarEventInput): Promise<void> {
    const fresh = await this.tokenService.getFreshTokens(input.userId);
    if (!fresh) return;

    const onTokenRefresh = this.tokenService.createRefreshCallback(input.userId);
    const eventInput = buildEventInput(input);
    const calendarId = fresh.calendarId;

    try {
      const event = input.calendarEventId
        ? await this.provider.updateEvent(
            calendarId,
            input.calendarEventId,
            eventInput,
            fresh.tokens,
            onTokenRefresh,
          )
        : await this.provider.createEvent(calendarId, eventInput, fresh.tokens, onTokenRefresh);

      await prisma.interview.update({
        where: { id: input.interviewId },
        data: {
          calendarEventId: event.id,
          calendarProvider: "google",
          syncStatus: "synced",
        },
      });

      await this.repository.updateSyncStatus(input.userId, new Date(), null);
    } catch {
      await prisma.interview.update({
        where: { id: input.interviewId },
        data: { syncStatus: "failed" },
      });
      await this.repository.updateSyncStatus(
        input.userId,
        null,
        "Falha ao sincronizar entrevista com o Google Calendar",
      );
    }
  }
}
