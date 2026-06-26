import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../app.js";

describe("GET /health", () => {
  it("should return health status", async () => {
    const app = createApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
      version: expect.any(String),
    });
    expect(typeof response.body.uptime).toBe("number");
  });
});
