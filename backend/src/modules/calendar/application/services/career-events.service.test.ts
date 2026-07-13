import { beforeEach, describe, expect, it, vi } from "vitest";

const findManyMock = vi.fn();
const getFreshTokensMock = vi.fn();
const listEventsMock = vi.fn();
const loggerErrorMock = vi.fn();

vi.mock("../../../../database/prisma.js", () => ({
  prisma: {
    interview: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

vi.mock("../../../../config/logger.js", () => ({
  logger: {
    error: (...args: unknown[]) => loggerErrorMock(...args),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("./calendar-token.service.js", () => ({
  CalendarTokenService: vi.fn().mockImplementation(() => ({
    getFreshTokens: (...args: unknown[]) => getFreshTokensMock(...args),
    createRefreshCallback: vi.fn(() => vi.fn()),
  })),
}));

import { CareerEventsService } from "./career-events.service.js";

describe("CareerEventsService", () => {
  const provider = {
    listEvents: (...args: unknown[]) => listEventsMock(...args),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    findManyMock.mockResolvedValue([]);
  });

  it("should return local events when Google enrichment fails and degrade is enabled", async () => {
    findManyMock.mockResolvedValue([
      {
        id: "int_1",
        notes: null,
        location: null,
        link: null,
        scheduledAt: new Date("2026-07-14T15:00:00.000Z"),
        meetingType: "video",
        calendarEventId: null,
        trackingId: "trk_1",
        tracking: {
          stage: "applied",
          job: { title: "Frontend", companyName: "Acme" },
        },
      },
    ]);
    getFreshTokensMock.mockRejectedValue(new Error("invalid_grant"));

    const service = new CareerEventsService({} as never, provider as never);
    const events = await service.listEvents(
      "user-1",
      new Date("2026-07-01T00:00:00.000Z"),
      new Date("2026-07-31T23:59:59.000Z"),
      { degradeOnProviderFailure: true },
    );

    expect(events).toHaveLength(1);
    expect(events[0]?.source).toBe("interview");
    expect(loggerErrorMock).toHaveBeenCalled();
  });

  it("should propagate Google errors when degrade is disabled", async () => {
    getFreshTokensMock.mockRejectedValue(new Error("invalid_grant"));

    const service = new CareerEventsService({} as never, provider as never);

    await expect(
      service.listEvents(
        "user-1",
        new Date("2026-07-01T00:00:00.000Z"),
        new Date("2026-07-31T23:59:59.000Z"),
      ),
    ).rejects.toThrow("invalid_grant");
  });
});
