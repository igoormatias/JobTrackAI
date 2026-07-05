export type CalendarIntegrationRecord = {
  id: string;
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date | null;
  calendarId: string | null;
  connectedAt: Date;
  revokedAt: Date | null;
};

export type UpsertCalendarIntegrationInput = {
  provider: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date | null;
  calendarId: string | null;
};

export interface CalendarIntegrationRepository {
  findActiveByUserId(userId: string): Promise<CalendarIntegrationRecord | null>;
  upsert(userId: string, input: UpsertCalendarIntegrationInput): Promise<CalendarIntegrationRecord>;
  revoke(userId: string): Promise<void>;
  updateTokens(userId: string, accessToken: string, tokenExpiry: Date | null): Promise<void>;
}
