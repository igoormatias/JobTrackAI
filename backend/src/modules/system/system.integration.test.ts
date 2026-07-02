import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../app.js";

describe("System module integration", () => {
  const app = createApp();

  it("GET /health should return health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
      version: expect.any(String),
    });
    expect(typeof response.body.uptime).toBe("number");
  });

  it("GET /version should return version info", async () => {
    const response = await request(app).get("/version");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      version: expect.any(String),
      name: "JobTrack AI API",
      environment: expect.any(String),
    });
  });

  it("GET /info should return system info", async () => {
    const response = await request(app).get("/info");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: "JobTrack AI API",
      description: expect.any(String),
      architecture: "Clean Architecture + DDD (lightweight)",
      modules: expect.arrayContaining(["system"]),
    });
  });
});
