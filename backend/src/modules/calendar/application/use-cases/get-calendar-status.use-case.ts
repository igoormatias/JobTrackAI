import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";

export class GetCalendarStatusUseCase {
  constructor(private readonly repository: CalendarIntegrationRepository) {}

  async execute(userId: string) {
    const integration = await this.repository.findActiveByUserId(userId);

    if (!integration) {
      return { connected: false, provider: null as string | null };
    }

    return {
      connected: true,
      provider: integration.provider,
      calendarId: integration.calendarId,
      connectedAt: integration.connectedAt.toISOString(),
    };
  }
}
