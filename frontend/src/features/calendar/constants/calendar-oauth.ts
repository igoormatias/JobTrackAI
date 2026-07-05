export const CALENDAR_RETURN_TO_KEY = "jobtrack:calendar-return-to";

export const DEFAULT_CALENDAR_RETURN_TO = "/settings?tab=integrations";

export const setCalendarReturnTo = (path: string): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CALENDAR_RETURN_TO_KEY, path);
};

export const consumeCalendarReturnTo = (): string => {
  if (typeof window === "undefined") return DEFAULT_CALENDAR_RETURN_TO;
  const value = sessionStorage.getItem(CALENDAR_RETURN_TO_KEY) ?? DEFAULT_CALENDAR_RETURN_TO;
  sessionStorage.removeItem(CALENDAR_RETURN_TO_KEY);
  return value;
};
