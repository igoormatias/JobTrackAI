import { EXPECTED_CALENDAR_SCOPES } from "../../domain/constants/calendar-scopes.js";
import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";

export class GetCalendarDebugUseCase {
  constructor(private readonly repository: CalendarIntegrationRepository) {}

  async execute(userId: string) {
    const integration = await this.repository.findActiveByUserId(userId);

    if (!integration) {
      return {
        connected: false,
        calendarId: null,
        scope: null,
        expectedScope: EXPECTED_CALENDAR_SCOPES.join(" "),
        tokenExpiresAt: null,
        refreshToken: false,
        lastSyncAt: null,
        lastError: null,
        accountEmail: null,
      };
    }

    return {
      connected: true,
      calendarId: integration.calendarId,
      scope: integration.scope,
      expectedScope: EXPECTED_CALENDAR_SCOPES.join(" "),
      tokenExpiresAt: integration.tokenExpiry?.toISOString() ?? null,
      refreshToken: Boolean(integration.refreshToken),
      lastSyncAt: integration.lastSyncAt?.toISOString() ?? null,
      lastError: integration.lastError,
      accountEmail: integration.accountEmail,
    };
  }
}
