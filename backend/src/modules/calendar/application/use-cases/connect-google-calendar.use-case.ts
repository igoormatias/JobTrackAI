import { encryptToken } from "../../../../shared/utils/token-crypto.utils.js";
import {
  EXPECTED_CALENDAR_SCOPES,
  hasCalendarEventsScope,
  PRIMARY_CALENDAR_ID,
} from "../../domain/constants/calendar-scopes.js";
import { CalendarConnectionError } from "../../domain/errors/calendar-connection.error.js";
import { CalendarScopeInsufficientError } from "../../domain/errors/calendar-scope-insufficient.error.js";
import { logCalendarOAuth } from "../../domain/utils/calendar-oauth-log.utils.js";
import type { CalendarProviderPort } from "../../domain/ports/calendar-provider.port.js";
import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";

export class ConnectGoogleCalendarUseCase {
  constructor(
    private readonly repository: CalendarIntegrationRepository,
    private readonly provider: CalendarProviderPort,
  ) {}

  async execute(userId: string, code: string) {
    const startedAt = Date.now();

    const tokens = await this.provider.exchangeCode(code);

    logCalendarOAuth({
      action: "exchange_code",
      userId,
      requestedScopes: EXPECTED_CALENDAR_SCOPES,
      receivedScopes: tokens.scope,
      hasRefreshToken: Boolean(tokens.refreshToken),
      tokenExpiry: tokens.tokenExpiry,
      accessToken: tokens.accessToken,
      durationMs: Date.now() - startedAt,
    });

    if (!hasCalendarEventsScope(tokens.scope)) {
      logCalendarOAuth({
        action: "scope_validation_failed",
        userId,
        requestedScopes: EXPECTED_CALENDAR_SCOPES,
        receivedScopes: tokens.scope,
      });
      throw new CalendarScopeInsufficientError();
    }

    const plainTokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiry: tokens.tokenExpiry,
    };

    const calendarId = this.provider.resolvePrimaryCalendarId();
    const onTokenRefresh = async (accessToken: string, tokenExpiry: Date | null) => {
      await this.repository.updateTokens(userId, accessToken, tokenExpiry);
    };

    try {
      await this.provider.validateConnection(calendarId, plainTokens, onTokenRefresh);
    } catch (error) {
      await this.repository.updateSyncStatus(userId, null, "Falha ao validar conexão com o Google Calendar");
      if (error instanceof CalendarConnectionError) throw error;
      throw new CalendarConnectionError();
    }

    const accountEmail = await this.provider.getAccountEmail(plainTokens);
    const now = new Date();

    const integration = await this.repository.upsert(userId, {
      provider: "google",
      accessToken: encryptToken(tokens.accessToken),
      refreshToken: encryptToken(tokens.refreshToken),
      tokenExpiry: tokens.tokenExpiry,
      calendarId,
      scope: tokens.scope,
      accountEmail,
      lastSyncAt: now,
      lastError: null,
    });

    logCalendarOAuth({
      action: "connect_success",
      userId,
      receivedScopes: tokens.scope,
      hasRefreshToken: true,
      tokenExpiry: tokens.tokenExpiry,
      calendarId: integration.calendarId,
      durationMs: Date.now() - startedAt,
      accessToken: tokens.accessToken,
    });

    return {
      connected: true,
      provider: integration.provider,
      calendarId: integration.calendarId ?? PRIMARY_CALENDAR_ID,
      connectedAt: integration.connectedAt.toISOString(),
      accountEmail: integration.accountEmail,
      scope: integration.scope,
      lastSyncAt: integration.lastSyncAt?.toISOString() ?? null,
      lastError: integration.lastError,
    };
  }
}
