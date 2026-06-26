import { describe, expect, it } from "vitest";

import { HealthService } from "./health.service.js";

describe("HealthService", () => {
  it("should return ok status with uptime and version", () => {
    const service = new HealthService();

    const result = service.getHealth("0.1.0");

    expect(result).toEqual({
      status: "ok",
      uptime: expect.any(Number),
      version: "0.1.0",
    });
  });
});
