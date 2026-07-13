import { beforeEach, describe, expect, it, vi } from "vitest";

const refreshAccessTokenMock = vi.fn();
const eventsListMock = vi.fn();

vi.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        setCredentials: vi.fn(),
        refreshAccessToken: refreshAccessTokenMock,
        on: vi.fn(),
      })),
    },
    calendar: vi.fn(() => ({
      events: {
        list: eventsListMock,
      },
    })),
  },
}));

vi.mock("../../../../config/env.js", () => ({
  env: {
    GOOGLE_CLIENT_ID: "client-id",
    GOOGLE_CLIENT_SECRET: "client-secret",
    FRONTEND_URL: "http://localhost:3000",
    GOOGLE_CALENDAR_REDIRECT_URI: undefined,
    NODE_ENV: "test",
  },
}));

import { CalendarOAuthError } from "../../domain/errors/calendar-oauth.error.js";
import { GoogleCalendarProvider } from "./google-calendar.provider.js";

describe("GoogleCalendarProvider", () => {
  const provider = new GoogleCalendarProvider();
  const tokens = {
    accessToken: "access",
    refreshToken: "refresh",
    tokenExpiry: new Date(Date.now() - 60_000),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("refreshAccessToken", () => {
    it("should map Google client errors to CalendarOAuthError", async () => {
      refreshAccessTokenMock.mockRejectedValue(new Error("invalid_grant"));

      await expect(provider.refreshAccessToken(tokens)).rejects.toBeInstanceOf(CalendarOAuthError);
    });

    it("should return refreshed tokens on success", async () => {
      refreshAccessTokenMock.mockResolvedValue({
        credentials: {
          access_token: "new-access",
          refresh_token: "new-refresh",
          expiry_date: Date.now() + 3_600_000,
        },
      });

      const result = await provider.refreshAccessToken(tokens);

      expect(result.accessToken).toBe("new-access");
      expect(result.refreshToken).toBe("new-refresh");
      expect(result.tokenExpiry).toBeInstanceOf(Date);
    });
  });

  describe("listEvents", () => {
    it("should ignore events without end and not throw", async () => {
      eventsListMock.mockResolvedValue({
        data: {
          items: [
            {
              id: "evt-valid",
              summary: "Valid",
              start: { dateTime: "2026-07-13T10:00:00.000Z" },
              end: { dateTime: "2026-07-13T11:00:00.000Z" },
            },
            {
              id: "evt-missing-end",
              summary: "Broken",
              start: { dateTime: "2026-07-13T12:00:00.000Z" },
            },
          ],
        },
      });

      const events = await provider.listEvents(
        "primary",
        new Date("2026-07-01T00:00:00.000Z"),
        new Date("2026-07-31T23:59:59.000Z"),
        tokens,
      );

      expect(events).toHaveLength(1);
      expect(events[0]?.id).toBe("evt-valid");
    });
  });
});
