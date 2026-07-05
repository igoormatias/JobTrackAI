import { prisma } from "../../../../database/prisma.js";
import { decryptToken } from "../../../../shared/utils/token-crypto.utils.js";
import type { CalendarProviderPort } from "../../domain/ports/calendar-provider.port.js";
import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";

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
  constructor(
    private readonly repository: CalendarIntegrationRepository,
    private readonly provider: CalendarProviderPort,
  ) {}

  async execute(input: SyncInterviewCalendarEventInput): Promise<void> {
    const integration = await this.repository.findActiveByUserId(input.userId);
    if (!integration?.calendarId) return;

    const tokens = {
      accessToken: decryptToken(integration.accessToken),
      refreshToken: decryptToken(integration.refreshToken),
      tokenExpiry: integration.tokenExpiry,
    };

    const onTokenRefresh = async (accessToken: string, tokenExpiry: Date | null) => {
      await this.repository.updateTokens(input.userId, accessToken, tokenExpiry);
    };

    const eventInput = buildEventInput(input);
    const calendarId = integration.calendarId;

    try {
      const event = input.calendarEventId
        ? await this.provider.updateEvent(
            calendarId,
            input.calendarEventId,
            eventInput,
            tokens,
            onTokenRefresh,
          )
        : await this.provider.createEvent(calendarId, eventInput, tokens, onTokenRefresh);

      await prisma.interview.update({
        where: { id: input.interviewId },
        data: {
          calendarEventId: event.id,
          calendarProvider: integration.provider,
          syncStatus: "synced",
        },
      });
    } catch {
      await prisma.interview.update({
        where: { id: input.interviewId },
        data: { syncStatus: "failed" },
      });
    }
  }
}
