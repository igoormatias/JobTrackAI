import { decryptToken } from "../../../../shared/utils/token-crypto.utils.js";
import type { CalendarProviderPort, CalendarProviderTokens } from "../../domain/ports/calendar-provider.port.js";
import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export class CalendarTokenService {
  constructor(
    private readonly repository: CalendarIntegrationRepository,
    private readonly provider: CalendarProviderPort,
  ) {}

  async getFreshTokens(userId: string): Promise<{
    tokens: CalendarProviderTokens;
    calendarId: string;
    integrationId: string;
  } | null> {
    const integration = await this.repository.findActiveByUserId(userId);
    if (!integration?.calendarId) return null;

    let tokens: CalendarProviderTokens = {
      accessToken: decryptToken(integration.accessToken),
      refreshToken: decryptToken(integration.refreshToken),
      tokenExpiry: integration.tokenExpiry,
    };

    const expiresSoon =
      !tokens.tokenExpiry || tokens.tokenExpiry.getTime() <= Date.now() + REFRESH_BUFFER_MS;

    if (expiresSoon) {
      tokens = await this.provider.refreshAccessToken(tokens);
      await this.repository.updateTokens(userId, tokens.accessToken, tokens.tokenExpiry);
    }

    return {
      tokens,
      calendarId: integration.calendarId,
      integrationId: integration.id,
    };
  }

  createRefreshCallback(userId: string) {
    return async (accessToken: string, tokenExpiry: Date | null) => {
      await this.repository.updateTokens(userId, accessToken, tokenExpiry);
    };
  }
}
