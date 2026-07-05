import { apiClient } from "@/lib/api-client/api-client";

export type CalendarStatus = {
  connected: boolean;
  provider: string | null;
  connectedAt?: string | null;
  calendarId?: string | null;
  accountEmail?: string | null;
  scope?: string | null;
  expectedScope?: string | null;
  lastSyncAt?: string | null;
  lastError?: string | null;
  tokenExpiresAt?: string | null;
  refreshToken?: boolean;
};

export type CalendarEventItem = {
  id: string;
  summary: string;
  description?: string | null;
  location?: string | null;
  htmlLink?: string | null;
  start: string;
  end: string;
  source?: "interview" | "google";
};

export type CalendarSyncResult = {
  connected: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
};

export const getCalendarStatus = async (): Promise<CalendarStatus> => {
  const { data } = await apiClient.get<CalendarStatus>("/calendar/status");
  return data;
};

export const getGoogleCalendarAuthUrl = async (): Promise<string> => {
  const { data } = await apiClient.get<{ authUrl: string }>("/calendar/google/auth-url");
  return data.authUrl;
};

export const connectGoogleCalendar = async (code: string): Promise<CalendarStatus> => {
  const { data } = await apiClient.post<CalendarStatus>("/calendar/google/callback", { code });
  return data;
};

export const disconnectGoogleCalendar = async (): Promise<void> => {
  await apiClient.delete("/calendar/google/disconnect");
};

export const syncGoogleCalendar = async (): Promise<CalendarSyncResult> => {
  const { data } = await apiClient.post<CalendarSyncResult>("/calendar/sync");
  return data;
};

export const listCalendarEvents = async (from: string, to: string): Promise<CalendarEventItem[]> => {
  const { data } = await apiClient.get<{ events: CalendarEventItem[] }>("/calendar/events", {
    params: { from, to },
  });
  return data.events;
};

export const dismissCalendarPrompt = async (): Promise<void> => {
  await apiClient.post("/calendar/dismiss-prompt");
};
