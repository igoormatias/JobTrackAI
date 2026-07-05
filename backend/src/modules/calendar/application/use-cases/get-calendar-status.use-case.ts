import { EXPECTED_CALENDAR_SCOPES } from "../../domain/constants/calendar-scopes.js";
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
      accountEmail: integration.accountEmail,
      scope: integration.scope,
      expectedScope: EXPECTED_CALENDAR_SCOPES.join(" "),
      lastSyncAt: integration.lastSyncAt?.toISOString() ?? null,
      lastError: integration.lastError,
      tokenExpiresAt: integration.tokenExpiry?.toISOString() ?? null,
      refreshToken: Boolean(integration.refreshToken),
    };
  }
}
