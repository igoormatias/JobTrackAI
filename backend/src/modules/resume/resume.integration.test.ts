import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";

import { prisma } from "../../database/prisma.js";
import { createIntegrationTestApp } from "../../test-utils/create-integration-test-app.js";
import { tokenService } from "../auth/services/token.service.js";
import { createResumeRoutes } from "./infrastructure/http/routes/resume.routes.js";

describe("Resume module integration", () => {
  const userId = "user_resume_test";
  const email = "resume@test.com";

  beforeAll(async () => {
    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, email, name: "Resume Test User" },
      update: { email, name: "Resume Test User" },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const app = createIntegrationTestApp((expressApp) => {
    expressApp.use("/resume", createResumeRoutes());
  });

  const authCookie = () => {
    const token = tokenService.signAccessToken({ userId, email });
    return `jt_access=${token}`;
  };

  it("GET /resume returns empty resume for new user", async () => {
    const response = await request(app).get("/resume").set("Cookie", authCookie());
    expect(response.status).toBe(200);
    expect(response.body.data.userId).toBe(userId);
  });

  it("PUT /resume creates version", async () => {
    const response = await request(app)
      .put("/resume")
      .set("Cookie", authCookie())
      .send({
        content: {
          professionalSummary: "Desenvolvedor Full Stack",
          experiences: [],
          education: [],
          certifications: [],
          languages: [],
          projects: [],
          softSkills: [],
          hardSkills: ["react"],
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.currentVersion.content.professionalSummary).toContain("Full Stack");
  });

  it("POST /resume/import/text structures resume", async () => {
    const response = await request(app)
      .post("/resume/import/text")
      .set("Cookie", authCookie())
      .send({ text: "João Silva\nDesenvolvedor React com 5 anos de experiência em TypeScript." });

    expect(response.status).toBe(201);
    expect(response.body.data.currentVersion).toBeDefined();
  }, 15000);

  it("GET /resume requires auth", async () => {
    const response = await request(app).get("/resume");
    expect(response.status).toBe(401);
  });
});
