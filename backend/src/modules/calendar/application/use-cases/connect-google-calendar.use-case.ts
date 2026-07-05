import { encryptToken } from "../../../../shared/utils/token-crypto.utils.js";
import type { CalendarProviderPort } from "../../domain/ports/calendar-provider.port.js";
import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";

export class ConnectGoogleCalendarUseCase {
  constructor(
    private readonly repository: CalendarIntegrationRepository,
    private readonly provider: CalendarProviderPort,
  ) {}

  async execute(userId: string, code: string) {
    const tokens = await this.provider.exchangeCode(code);
    const plainTokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiry: tokens.tokenExpiry,
    };

    const calendarId = await this.provider.getPrimaryCalendarId(plainTokens, async (accessToken, tokenExpiry) => {
      await this.repository.updateTokens(userId, accessToken, tokenExpiry);
    });

    const integration = await this.repository.upsert(userId, {
      provider: "google",
      accessToken: encryptToken(tokens.accessToken),
      refreshToken: encryptToken(tokens.refreshToken),
      tokenExpiry: tokens.tokenExpiry,
      calendarId,
    });

    return {
      connected: true,
      provider: integration.provider,
      calendarId: integration.calendarId,
      connectedAt: integration.connectedAt.toISOString(),
    };
  }
}
