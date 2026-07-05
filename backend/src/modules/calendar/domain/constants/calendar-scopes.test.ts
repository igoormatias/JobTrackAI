import { describe, expect, it } from "vitest";

import {
  CALENDAR_EVENTS_SCOPE,
  hasCalendarEventsScope,
  PRIMARY_CALENDAR_ID,
} from "./calendar-scopes.js";

describe("calendar-scopes", () => {
  it("detects calendar.events in scope string", () => {
    expect(
      hasCalendarEventsScope(`openid email profile ${CALENDAR_EVENTS_SCOPE}`),
    ).toBe(true);
  });

  it("rejects scope without calendar.events", () => {
    expect(hasCalendarEventsScope("openid email profile")).toBe(false);
    expect(hasCalendarEventsScope(null)).toBe(false);
  });

  it("uses primary calendar id constant", () => {
    expect(PRIMARY_CALENDAR_ID).toBe("primary");
  });
});
