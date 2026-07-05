import type {
  CalendarEvent,
  CalendarEventInput,
  CalendarProviderPort,
  CalendarProviderTokens,
  TokenRefreshCallback,
} from "../../domain/ports/calendar-provider.port.js";

const notImplemented = (): never => {
  throw new Error("Outlook calendar provider is not implemented");
};

export class OutlookCalendarProvider implements CalendarProviderPort {
  getAuthUrl(): string {
    return notImplemented();
  }

  async exchangeCode(): Promise<never> {
    return notImplemented();
  }

  async getPrimaryCalendarId(): Promise<never> {
    return notImplemented();
  }

  async createEvent(
    _calendarId: string,
    _event: CalendarEventInput,
    _tokens: CalendarProviderTokens,
    _onTokenRefresh?: TokenRefreshCallback,
  ): Promise<CalendarEvent> {
    return notImplemented();
  }

  async updateEvent(
    _calendarId: string,
    _eventId: string,
    _event: Partial<CalendarEventInput>,
    _tokens: CalendarProviderTokens,
    _onTokenRefresh?: TokenRefreshCallback,
  ): Promise<CalendarEvent> {
    return notImplemented();
  }

  async deleteEvent(
    _calendarId: string,
    _eventId: string,
    _tokens: CalendarProviderTokens,
    _onTokenRefresh?: TokenRefreshCallback,
  ): Promise<void> {
    return notImplemented();
  }

  async listEvents(
    _calendarId: string,
    _from: Date,
    _to: Date,
    _tokens: CalendarProviderTokens,
    _onTokenRefresh?: TokenRefreshCallback,
  ): Promise<CalendarEvent[]> {
    return notImplemented();
  }
}
