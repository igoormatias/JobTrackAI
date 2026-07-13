import { format } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAgendaGroupLabel, parseLocalDayKey } from "./agenda-group-label";

describe("parseLocalDayKey", () => {
  it("should parse yyyy-MM-dd as local calendar day (not UTC midnight)", () => {
    const date = parseLocalDayKey("2026-07-13");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(13);
    expect(format(date, "yyyy-MM-dd")).toBe("2026-07-13");
  });
});

describe("getAgendaGroupLabel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 13, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return Hoje for today's local day key", () => {
    expect(getAgendaGroupLabel(parseLocalDayKey("2026-07-13"))).toBe("Hoje");
  });

  it("should return Amanhã for tomorrow's local day key", () => {
    expect(getAgendaGroupLabel(parseLocalDayKey("2026-07-14"))).toBe("Amanhã");
  });

  it("should avoid UTC date-only parsing shifting the calendar day", () => {
    const dayKey = "2026-07-13";
    const local = parseLocalDayKey(dayKey);
    const utcParsed = new Date(dayKey);

    expect(format(local, "yyyy-MM-dd")).toBe(dayKey);
    expect(getAgendaGroupLabel(local)).toBe("Hoje");

    if (utcParsed.getDate() !== local.getDate()) {
      expect(getAgendaGroupLabel(utcParsed)).not.toBe("Hoje");
    }
  });
});
