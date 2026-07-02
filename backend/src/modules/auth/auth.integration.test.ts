import request from "supertest";
import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("./services/google-auth.service.js", () => ({
  createGoogleAuthService: () => ({
    verifyIdToken: async () => ({
      sub: "google_test_0001",
      email: "matias.silva@email.com",
      name: "Matias Silva",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Matias",
    }),
  }),
}));

import { createApp } from "../../app.js";
import { userRepository } from "./repositories/user.repository.js";

describe("Auth routes", () => {
  beforeEach(() => {
    userRepository.reset();
  });

  it("POST /auth/login sets cookies and returns user", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/auth/login")
      .send({ provider: "google", idToken: "test-id-token" });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe("matias.silva@email.com");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("GET /auth/me returns current user when authenticated", async () => {
    const app = createApp();
    const agent = request.agent(app);

    await agent.post("/auth/login").send({ provider: "google", idToken: "test-id-token" });

    const response = await agent.get("/auth/me");

    expect(response.status).toBe(200);
    expect(response.body.data.user.name).toBe("Matias Silva");
  });

  it("POST /auth/logout clears session", async () => {
    const app = createApp();
    const agent = request.agent(app);

    await agent.post("/auth/login").send({ provider: "google", idToken: "test-id-token" });
    const logout = await agent.post("/auth/logout");

    expect(logout.status).toBe(200);

    const me = await agent.get("/auth/me");
    expect(me.status).toBe(401);
  });
});
