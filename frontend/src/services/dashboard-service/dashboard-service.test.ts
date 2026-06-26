import { describe, expect, it } from "vitest";

import { getDashboard } from "./dashboard-service";

describe("dashboard-service", () => {
  it("fetches dashboard data", async () => {
    const dashboard = await getDashboard();

    expect(dashboard.kpis.length).toBeGreaterThan(0);
    expect(dashboard.generatedAt).toBeTruthy();
  });
});
