export const CALENDAR_EVENTS_SCOPE = "https://www.googleapis.com/auth/calendar.events";

export const EXPECTED_CALENDAR_SCOPES = [
  "openid",
  "email",
  "profile",
  CALENDAR_EVENTS_SCOPE,
] as const;

export const PRIMARY_CALENDAR_ID = "primary";

export const hasCalendarEventsScope = (scope: string | null | undefined): boolean => {
  if (!scope) return false;
  return scope.split(/\s+/).includes(CALENDAR_EVENTS_SCOPE);
};
