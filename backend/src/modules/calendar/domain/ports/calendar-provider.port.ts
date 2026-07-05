export type CalendarEventInput = {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
};

export type CalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  htmlLink?: string;
};

export type CalendarAuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date | null;
};

export type CalendarProviderTokens = {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date | null;
};

export type TokenRefreshCallback = (
  accessToken: string,
  tokenExpiry: Date | null,
) => void | Promise<void>;

export interface CalendarProviderPort {
  getAuthUrl(state: string): string;
  exchangeCode(code: string): Promise<CalendarAuthTokens>;
  getPrimaryCalendarId(tokens: CalendarProviderTokens, onTokenRefresh?: TokenRefreshCallback): Promise<string>;
  createEvent(
    calendarId: string,
    event: CalendarEventInput,
    tokens: CalendarProviderTokens,
    onTokenRefresh?: TokenRefreshCallback,
  ): Promise<CalendarEvent>;
  updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<CalendarEventInput>,
    tokens: CalendarProviderTokens,
    onTokenRefresh?: TokenRefreshCallback,
  ): Promise<CalendarEvent>;
  deleteEvent(
    calendarId: string,
    eventId: string,
    tokens: CalendarProviderTokens,
    onTokenRefresh?: TokenRefreshCallback,
  ): Promise<void>;
  listEvents(
    calendarId: string,
    from: Date,
    to: Date,
    tokens: CalendarProviderTokens,
    onTokenRefresh?: TokenRefreshCallback,
  ): Promise<CalendarEvent[]>;
}
