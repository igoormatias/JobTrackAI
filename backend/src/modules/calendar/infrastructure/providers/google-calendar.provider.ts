import { google } from "googleapis";

import { env } from "../../../../config/env.js";
import {
  EXPECTED_CALENDAR_SCOPES,
  PRIMARY_CALENDAR_ID,
} from "../../domain/constants/calendar-scopes.js";
import { CalendarConnectionError } from "../../domain/errors/calendar-connection.error.js";
import { CalendarOAuthError } from "../../domain/errors/calendar-oauth.error.js";
import type {
  CalendarAuthTokens,
  CalendarEvent,
  CalendarEventInput,
  CalendarProviderPort,
  CalendarProviderTokens,
  TokenRefreshCallback,
} from "../../domain/ports/calendar-provider.port.js";

const mapGoogleEvent = (item: {
  id?: string | null;
  summary?: string | null;
  description?: string | null;
  location?: string | null;
  htmlLink?: string | null;
  start?: { dateTime?: string | null; date?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null } | null;
}): CalendarEvent => {
  const startRaw = item.start?.dateTime ?? item.start?.date;
  const endRaw = item.end?.dateTime ?? item.end?.date;

  if (!item.id || !startRaw || !endRaw) {
    throw new Error("Invalid Google Calendar event payload");
  }

  return {
    id: item.id,
    summary: item.summary ?? "Untitled",
    description: item.description ?? undefined,
    location: item.location ?? undefined,
    htmlLink: item.htmlLink ?? undefined,
    start: new Date(startRaw),
    end: new Date(endRaw),
  };
};

const mapGoogleError = (error: unknown): CalendarOAuthError | CalendarConnectionError => {
  const reason =
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { error?: { message?: string; errors?: Array<{ reason?: string }> } } } })
      .response?.data?.error?.errors?.[0]?.reason === "string"
      ? (error as { response: { data: { error: { errors: Array<{ reason: string }> } } } }).response.data.error
          .errors[0].reason
      : undefined;

  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: string }).message === "string"
      ? (error as { message: string }).message
      : "Google Calendar API error";

  if (reason === "ACCESS_TOKEN_SCOPE_INSUFFICIENT" || reason === "insufficientPermissions") {
    return new CalendarConnectionError(
      "Permissões insuficientes para acessar o Google Calendar. Reconecte a integração.",
    );
  }

  return new CalendarOAuthError(message);
};

export class GoogleCalendarProvider implements CalendarProviderPort {
  private getRedirectUri(): string {
    return env.GOOGLE_CALENDAR_REDIRECT_URI ?? `${env.FRONTEND_URL}/settings/calendar/callback`;
  }

  private createOAuthClient(tokens?: CalendarProviderTokens) {
    const client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      this.getRedirectUri(),
    );

    if (tokens) {
      client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expiry_date: tokens.tokenExpiry?.getTime(),
      });
    }

    return client;
  }

  private bindTokenRefresh(client: ReturnType<typeof this.createOAuthClient>, onTokenRefresh?: TokenRefreshCallback) {
    if (!onTokenRefresh) return;

    client.on("tokens", (newTokens) => {
      if (!newTokens.access_token) return;
      void onTokenRefresh(
        newTokens.access_token,
        newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
      );
    });
  }

  private getCalendarApi(
    tokens: CalendarProviderTokens,
    onTokenRefresh?: TokenRefreshCallback,
  ) {
    const client = this.createOAuthClient(tokens);
    this.bindTokenRefresh(client, onTokenRefresh);
    return google.calendar({ version: "v3", auth: client });
  }

  getAuthUrl(state: string): string {
    const client = this.createOAuthClient();
    return client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: true,
      scope: [...EXPECTED_CALENDAR_SCOPES],
      state,
    });
  }

  async exchangeCode(code: string): Promise<CalendarAuthTokens> {
    try {
      const client = this.createOAuthClient();
      const { tokens } = await client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new CalendarOAuthError(
          "O Google não retornou os tokens necessários. Tente conectar novamente.",
          422,
        );
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope ?? null,
      };
    } catch (error) {
      if (error instanceof CalendarOAuthError) throw error;
      throw mapGoogleError(error);
    }
  }

  resolvePrimaryCalendarId(): string {
    return PRIMARY_CALENDAR_ID;
  }

  async validateConnection(
    calendarId: string,
    tokens: CalendarProviderTokens,
    onTokenRefresh?: TokenRefreshCallback,
  ): Promise<void> {
    try {
      const calendar = this.getCalendarApi(tokens, onTokenRefresh);
      const now = new Date();
      await calendar.events.list({
        calendarId,
        timeMin: now.toISOString(),
        maxResults: 1,
        singleEvents: true,
      });
    } catch (error) {
      throw mapGoogleError(error);
    }
  }

  async getAccountEmail(tokens: CalendarProviderTokens): Promise<string | null> {
    try {
      const client = this.createOAuthClient(tokens);
      const oauth2 = google.oauth2({ version: "v2", auth: client });
      const response = await oauth2.userinfo.get();
      return response.data.email ?? null;
    } catch {
      return null;
    }
  }

  async revokeToken(tokens: CalendarProviderTokens): Promise<void> {
    try {
      const client = this.createOAuthClient(tokens);
      await client.revokeToken(tokens.accessToken);
    } catch {
      // Best-effort revoke — local disconnect still proceeds
    }
  }

  async refreshAccessToken(tokens: CalendarProviderTokens): Promise<CalendarProviderTokens> {
    try {
      const client = this.createOAuthClient(tokens);
      const { credentials } = await client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new CalendarOAuthError("Não foi possível renovar o token do Google Calendar.", 422);
      }

      return {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token ?? tokens.refreshToken,
        tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      };
    } catch (error) {
      if (error instanceof CalendarOAuthError || error instanceof CalendarConnectionError) {
        throw error;
      }
      throw mapGoogleError(error);
    }
  }

  async createEvent(
    calendarId: string,
    event: CalendarEventInput,
    tokens: CalendarProviderTokens,
    onTokenRefresh?: TokenRefreshCallback,
  ): Promise<CalendarEvent> {
    const calendar = this.getCalendarApi(tokens, onTokenRefresh);
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: { dateTime: event.start.toISOString() },
        end: { dateTime: event.end.toISOString() },
      },
    });

    return mapGoogleEvent(response.data);
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<CalendarEventInput>,
    tokens: CalendarProviderTokens,
    onTokenRefresh?: TokenRefreshCallback,
  ): Promise<CalendarEvent> {
    const calendar = this.getCalendarApi(tokens, onTokenRefresh);
    const response = await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: {
        ...(event.summary !== undefined ? { summary: event.summary } : {}),
        ...(event.description !== undefined ? { description: event.description } : {}),
        ...(event.location !== undefined ? { location: event.location } : {}),
        ...(event.start !== undefined ? { start: { dateTime: event.start.toISOString() } } : {}),
        ...(event.end !== undefined ? { end: { dateTime: event.end.toISOString() } } : {}),
      },
    });

    return mapGoogleEvent(response.data);
  }

  async deleteEvent(
    calendarId: string,
    eventId: string,
    tokens: CalendarProviderTokens,
    onTokenRefresh?: TokenRefreshCallback,
  ): Promise<void> {
    const calendar = this.getCalendarApi(tokens, onTokenRefresh);
    await calendar.events.delete({ calendarId, eventId });
  }

  async listEvents(
    calendarId: string,
    from: Date,
    to: Date,
    tokens: CalendarProviderTokens,
    onTokenRefresh?: TokenRefreshCallback,
  ): Promise<CalendarEvent[]> {
    const calendar = this.getCalendarApi(tokens, onTokenRefresh);
    const response = await calendar.events.list({
      calendarId,
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return (response.data.items ?? [])
      .filter(
        (item) =>
          item.id &&
          (item.start?.dateTime || item.start?.date) &&
          (item.end?.dateTime || item.end?.date),
      )
      .map((item) => mapGoogleEvent(item));
  }
}

export const googleCalendarProvider = new GoogleCalendarProvider();
