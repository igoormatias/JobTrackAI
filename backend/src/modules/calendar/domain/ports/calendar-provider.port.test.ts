import { describe, expect, it, vi } from "vitest";

import type { CalendarProviderPort } from "./calendar-provider.port.js";

describe("calendar-provider.port", () => {
  it("can be mocked for dependency injection", async () => {
    const provider: CalendarProviderPort = {
      getAuthUrl: vi.fn(() => "https://example.com/auth"),
      exchangeCode: vi.fn(async () => ({
        accessToken: "access",
        refreshToken: "refresh",
        tokenExpiry: null,
        scope: "calendar.events",
      })),
      resolvePrimaryCalendarId: vi.fn(() => "primary"),
      validateConnection: vi.fn(async () => undefined),
      getAccountEmail: vi.fn(async () => "user@example.com"),
      revokeToken: vi.fn(async () => undefined),
      refreshAccessToken: vi.fn(async () => ({
        accessToken: "access",
        refreshToken: "refresh",
        tokenExpiry: null,
      })),
      createEvent: vi.fn(async () => ({
        id: "evt-1",
        summary: "Interview",
        start: new Date("2026-07-10T15:00:00.000Z"),
        end: new Date("2026-07-10T16:00:00.000Z"),
      })),
      updateEvent: vi.fn(),
      deleteEvent: vi.fn(),
      listEvents: vi.fn(async () => []),
    };

    const authUrl = provider.getAuthUrl("user-1");
    const events = await provider.listEvents(
      "primary",
      new Date("2026-07-01T00:00:00.000Z"),
      new Date("2026-07-31T23:59:59.000Z"),
      { accessToken: "access", refreshToken: "refresh", tokenExpiry: null },
    );

    expect(authUrl).toContain("https://example.com/auth");
    expect(events).toEqual([]);
    expect(provider.getAuthUrl).toHaveBeenCalledWith("user-1");
    expect(provider.listEvents).toHaveBeenCalledOnce();
  });
});
