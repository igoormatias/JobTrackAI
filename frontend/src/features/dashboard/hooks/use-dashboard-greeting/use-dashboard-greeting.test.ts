import { describe, expect, it } from "vitest";

import { buildDashboardGreeting, getGreetingPeriod } from "../../utils/get-dashboard-greeting";

describe("getGreetingPeriod", () => {
  it("returns Bom dia before noon", () => {
    expect(getGreetingPeriod(new Date("2026-06-26T09:00:00"))).toBe("Bom dia");
  });

  it("returns Boa tarde in the afternoon", () => {
    expect(getGreetingPeriod(new Date("2026-06-26T14:00:00"))).toBe("Boa tarde");
  });

  it("returns Boa noite at night", () => {
    expect(getGreetingPeriod(new Date("2026-06-26T20:00:00"))).toBe("Boa noite");
  });
});

describe("buildDashboardGreeting", () => {
  it("includes first name and emoji", () => {
    expect(buildDashboardGreeting("Igor Santos", new Date("2026-06-26T09:00:00"))).toBe(
      "Bom dia, Igor 👋",
    );
  });
});
