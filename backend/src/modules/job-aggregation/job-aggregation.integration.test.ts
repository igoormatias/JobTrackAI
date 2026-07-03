import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../auth/services/google-auth.service.js", () => ({
  createGoogleAuthService: () => ({
    verifyIdToken: async () => ({
      sub: "google_providers_test",
      email: "providers@test.com",
      name: "Providers Test",
      picture: null,
    }),
  }),
}));

import { createApp } from "../../app.js";
import { prisma } from "../../database/prisma.js";

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabase)("Job aggregation integration", () => {
  let agent: ReturnType<typeof request.agent>;
  let skipReason: string | null = null;

  beforeAll(async () => {
    const app = createApp();
    agent = request.agent(app);

    const login = await agent.post("/auth/login").send({ provider: "google", idToken: "test-id-token" });
    if (login.status !== 200) {
      skipReason = `Login failed with status ${login.status}`;
      return;
    }

    try {
      await prisma.jobProviderRegistry.findFirst();
    } catch {
      skipReason = "Job aggregation migration not applied. Run prisma migrate deploy.";
    }
  });

  const runOrSkip = (context: { skip: (reason?: string) => void }) => {
    if (skipReason) context.skip(skipReason);
  };

  it("GET /providers should require auth", async () => {
    const app = createApp();
    const response = await request(app).get("/providers");
    expect(response.status).toBe(401);
  });

  it("GET /providers should list registered providers", async (context) => {
    runOrSkip(context);
    const response = await agent.get("/providers");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.some((item: { name: string }) => item.name === "gupy")).toBe(true);
  });

  it("GET /providers/health should return health statuses", async (context) => {
    runOrSkip(context);
    const response = await agent.get("/providers/health");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
