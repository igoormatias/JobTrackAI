import { describe, expect, it, vi } from "vitest";

import { ConnectGoogleCalendarUseCase } from "./connect-google-calendar.use-case.js";
import { CalendarScopeInsufficientError } from "../../domain/errors/calendar-scope-insufficient.error.js";
import { CALENDAR_EVENTS_SCOPE } from "../../domain/constants/calendar-scopes.js";

describe("ConnectGoogleCalendarUseCase", () => {
  const repository = {
    upsert: vi.fn(),
    updateTokens: vi.fn(),
    updateSyncStatus: vi.fn(),
  };

  const provider = {
    exchangeCode: vi.fn(),
    resolvePrimaryCalendarId: vi.fn(() => "primary"),
    validateConnection: vi.fn(),
    getAccountEmail: vi.fn(async () => "user@example.com"),
  };

  it("throws when calendar.events scope is missing", async () => {
    provider.exchangeCode.mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
      tokenExpiry: new Date(),
      scope: "openid email profile",
    });

    const useCase = new ConnectGoogleCalendarUseCase(repository as never, provider as never);

    await expect(useCase.execute("user-1", "code")).rejects.toBeInstanceOf(
      CalendarScopeInsufficientError,
    );
  });

  it("connects using primary calendar without calendarList", async () => {
    provider.exchangeCode.mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
      tokenExpiry: new Date(),
      scope: `openid email profile ${CALENDAR_EVENTS_SCOPE}`,
    });
    provider.validateConnection.mockResolvedValue(undefined);
    repository.upsert.mockResolvedValue({
      provider: "google",
      calendarId: "primary",
      connectedAt: new Date(),
      accountEmail: "user@example.com",
      scope: CALENDAR_EVENTS_SCOPE,
      lastSyncAt: new Date(),
      lastError: null,
    });

    const useCase = new ConnectGoogleCalendarUseCase(repository as never, provider as never);
    const result = await useCase.execute("user-1", "code");

    expect(provider.resolvePrimaryCalendarId).toHaveBeenCalled();
    expect(provider.validateConnection).toHaveBeenCalledWith(
      "primary",
      expect.objectContaining({ accessToken: "access" }),
      expect.any(Function),
    );
    expect(result.connected).toBe(true);
    expect(result.calendarId).toBe("primary");
  });
});
