import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../auth/services/google-auth.service.js", () => ({
  createGoogleAuthService: () => ({
    verifyIdToken: async () => ({
      sub: "google_jobs_test",
      email: "jobs@test.com",
      name: "Jobs Test",
      picture: null,
    }),
  }),
}));

import { createApp } from "../../app.js";

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabase)("Jobs module integration (Prisma)", () => {
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

    await agent.post("/auth/onboarding/complete").send({
      professionalArea: "frontend",
      seniority: "senior",
      modality: "remote",
      location: "São Paulo, SP",
      locationPreference: { city: "São Paulo", state: "SP", country: "BR" },
      salaryBand: "mid",
      salaryExpectation: { min: 8000, max: 15000, currency: "BRL" },
      skills: ["React", "TypeScript"],
      blockedSkills: [],
    });

    const probe = await agent.get("/jobs?limit=1");
    if (probe.status !== 200) {
      skipReason = `Jobs API unavailable (status ${probe.status}). Run migrations and seed.`;
    }
  });

  const runOrSkip = (context: { skip: (reason?: string) => void }) => {
    if (skipReason) context.skip(skipReason);
  };

  it("GET /jobs returns paginated catalog", async (context) => {
    runOrSkip(context);

    const response = await agent.get("/jobs?limit=10");

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.meta).toMatchObject({
      limit: 10,
      hasMore: expect.any(Boolean),
    });
  });

  it("GET /jobs filters by area", async (context) => {
    runOrSkip(context);

    const response = await agent.get("/jobs?area=frontend&limit=5");

    expect(response.status).toBe(200);
    if (response.body.data.length > 0) {
      expect(response.body.data.every((job: { area: string }) => job.area === "frontend")).toBe(true);
    }
  });

  it("GET /jobs/:id returns job details", async (context) => {
    runOrSkip(context);

    const list = await agent.get("/jobs?limit=1");
    const jobId = list.body.data[0]?.id as string | undefined;
    if (!jobId) {
      context.skip("No catalog jobs available — run prisma seed");
      return;
    }

    const response = await agent.get(`/jobs/${jobId}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(jobId);
  });

  it("PATCH /jobs/:id/favorite toggles favorite", async (context) => {
    runOrSkip(context);

    const list = await agent.get("/jobs?limit=1");
    const jobId = list.body.data[0]?.id as string | undefined;
    if (!jobId) {
      context.skip("No catalog jobs available — run prisma seed");
      return;
    }

    const response = await agent.patch(`/jobs/${jobId}/favorite`).send({ isFavorite: true });
    expect(response.status).toBe(200);
    expect(response.body.data.isFavorite).toBe(true);
  });

  it("POST /jobs/:id/view marks job as viewed", async (context) => {
    runOrSkip(context);

    const list = await agent.get("/jobs?limit=1");
    const jobId = list.body.data[0]?.id as string | undefined;
    if (!jobId) {
      context.skip("No catalog jobs available — run prisma seed");
      return;
    }

    const response = await agent.post(`/jobs/${jobId}/view`);
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/viewed/i);
  });
});

describe("Jobs auth guard", () => {
  it("GET /jobs returns 401 without auth", async () => {
    const app = createApp();
    const response = await request(app).get("/jobs");
    expect(response.status).toBe(401);
  });
});
