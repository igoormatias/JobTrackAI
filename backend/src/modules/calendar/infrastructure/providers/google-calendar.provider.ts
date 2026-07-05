import { google } from "googleapis";

import { env } from "../../../../config/env.js";
import type {
  CalendarAuthTokens,
  CalendarEvent,
  CalendarEventInput,
  CalendarProviderPort,
  CalendarProviderTokens,
  TokenRefreshCallback,
} from "../../domain/ports/calendar-provider.port.js";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

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
      scope: [CALENDAR_SCOPE],
      state,
    });
  }

  async exchangeCode(code: string): Promise<CalendarAuthTokens> {
    const client = this.createOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Google OAuth did not return required tokens");
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    };
  }

  async getPrimaryCalendarId(
    tokens: CalendarProviderTokens,
    onTokenRefresh?: TokenRefreshCallback,
  ): Promise<string> {
    const calendar = this.getCalendarApi(tokens, onTokenRefresh);
    const response = await calendar.calendarList.list({ minAccessRole: "writer" });
    const primary = response.data.items?.find((item) => item.primary)?.id;
    return primary ?? "primary";
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
      .filter((item) => item.id && (item.start?.dateTime || item.start?.date))
      .map((item) => mapGoogleEvent(item));
  }
}

export const googleCalendarProvider = new GoogleCalendarProvider();
