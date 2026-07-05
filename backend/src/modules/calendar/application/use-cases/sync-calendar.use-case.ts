import { CalendarConnectionError } from "../../domain/errors/calendar-connection.error.js";
import { logCalendarOAuth } from "../../domain/utils/calendar-oauth-log.utils.js";
import type { CalendarProviderPort } from "../../domain/ports/calendar-provider.port.js";
import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";
import { CalendarTokenService } from "../services/calendar-token.service.js";

export class SyncCalendarUseCase {
  private readonly tokenService: CalendarTokenService;

  constructor(
    private readonly repository: CalendarIntegrationRepository,
    private readonly provider: CalendarProviderPort,
  ) {
    this.tokenService = new CalendarTokenService(repository, provider);
  }

  async execute(userId: string) {
    const startedAt = Date.now();
    const fresh = await this.tokenService.getFreshTokens(userId);

    if (!fresh) {
      throw new CalendarConnectionError("Nenhuma integração ativa com o Google Calendar.");
    }

    const onTokenRefresh = this.tokenService.createRefreshCallback(userId);

    try {
      await this.provider.validateConnection(fresh.calendarId, fresh.tokens, onTokenRefresh);
      const now = new Date();
      await this.repository.updateSyncStatus(userId, now, null);

      logCalendarOAuth({
        action: "sync_success",
        userId,
        calendarId: fresh.calendarId,
        durationMs: Date.now() - startedAt,
        accessToken: fresh.tokens.accessToken,
      });

      return {
        connected: true,
        lastSyncAt: now.toISOString(),
        lastError: null,
      };
    } catch (error) {
      const message =
        error instanceof CalendarConnectionError
          ? error.message
          : "Falha ao sincronizar com o Google Calendar.";
      await this.repository.updateSyncStatus(userId, null, message);
      throw error instanceof CalendarConnectionError ? error : new CalendarConnectionError(message);
    }
  }
}
