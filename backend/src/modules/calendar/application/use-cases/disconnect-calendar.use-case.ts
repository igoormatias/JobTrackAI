import { decryptToken } from "../../../../shared/utils/token-crypto.utils.js";
import { logCalendarOAuth } from "../../domain/utils/calendar-oauth-log.utils.js";
import type { CalendarProviderPort } from "../../domain/ports/calendar-provider.port.js";
import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";

export class DisconnectCalendarUseCase {
  constructor(
    private readonly repository: CalendarIntegrationRepository,
    private readonly provider: CalendarProviderPort,
  ) {}

  async execute(userId: string) {
    const integration = await this.repository.findActiveByUserId(userId);

    if (integration) {
      try {
        await this.provider.revokeToken({
          accessToken: decryptToken(integration.accessToken),
          refreshToken: decryptToken(integration.refreshToken),
          tokenExpiry: integration.tokenExpiry,
        });
      } catch {
        // Best-effort revoke
      }
    }

    await this.repository.revoke(userId);

    logCalendarOAuth({ action: "disconnect", userId });

    return { connected: false };
  }
}
