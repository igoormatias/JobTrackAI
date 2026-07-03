import { describe, expect, it } from "vitest";
import request from "supertest";
import { Router } from "express";

import { createIntegrationTestApp } from "../../test-utils/create-integration-test-app.js";
import { requireAuth } from "../../middlewares/auth-middleware.js";
import { tokenService } from "../auth/services/token.service.js";
import { AiCareerAnalysisController } from "./infrastructure/http/controllers/ai-career-analysis.controller.js";
import type { CareerAnalysisResponseDto } from "./application/dto/career-analysis-response.dto.js";
import {
  GenerateCareerAnalysisUseCase,
  GetCareerAnalysisUseCase,
} from "./application/use-cases/career-analysis.use-cases.js";

const sampleDto: CareerAnalysisResponseDto = {
  summary: "Resumo",
  matchExplanation: "Explicação",
  strengths: [],
  weaknesses: [],
  missingSkills: [],
  learningRecommendations: [],
  interviewPreparation: [],
  careerInsights: [],
  nextSteps: [],
  confidence: 0.9,
  generatedAt: new Date().toISOString(),
  provider: "gemini",
  model: "gemini-2.5-flash",
  engineVersion: "ai-career-v1",
  matchEngineVersion: "rules-v2",
  cached: false,
};

const createTestAiRoutes = (getResult: CareerAnalysisResponseDto | null, generateResult?: CareerAnalysisResponseDto) => {
  const getUseCase = {
    execute: async () => getResult,
  } as GetCareerAnalysisUseCase;

  const generateUseCase = {
    execute: async () => generateResult ?? sampleDto,
  } as GenerateCareerAnalysisUseCase;

  const router = Router();
  const controller = new AiCareerAnalysisController(getUseCase, generateUseCase);
  router.use(requireAuth);
  router.get("/career-analysis/:trackingId", controller.get);
  router.post("/career-analysis/:trackingId", controller.generate);
  return router;
};

describe("AI career analysis integration", () => {
  const userId = "user_ai_1";
  const email = "ai@test.com";
  const trackingId = "track_ai_1";

  const authCookie = () => {
    const token = tokenService.signAccessToken({ userId, email });
    return `jt_access=${token}`;
  };

  it("GET returns 204 when no analysis exists", async () => {
    const app = createIntegrationTestApp((expressApp) => {
      expressApp.use("/ai", createTestAiRoutes(null));
    });

    const response = await request(app)
      .get(`/ai/career-analysis/${trackingId}`)
      .set("Cookie", authCookie());

    expect(response.status).toBe(204);
  });

  it("GET returns analysis when available", async () => {
    const app = createIntegrationTestApp((expressApp) => {
      expressApp.use("/ai", createTestAiRoutes({ ...sampleDto, cached: true }));
    });

    const response = await request(app)
      .get(`/ai/career-analysis/${trackingId}`)
      .set("Cookie", authCookie());

    expect(response.status).toBe(200);
    expect(response.body.data.cached).toBe(true);
  });

  it("POST generates analysis", async () => {
    const app = createIntegrationTestApp((expressApp) => {
      expressApp.use("/ai", createTestAiRoutes(null, sampleDto));
    });

    const response = await request(app)
      .post(`/ai/career-analysis/${trackingId}`)
      .set("Cookie", authCookie());

    expect(response.status).toBe(201);
    expect(response.body.data.engineVersion).toBe("ai-career-v1");
  });

  it("requires authentication", async () => {
    const app = createIntegrationTestApp((expressApp) => {
      expressApp.use("/ai", createTestAiRoutes(null));
    });

    const response = await request(app).get(`/ai/career-analysis/${trackingId}`);
    expect(response.status).toBe(401);
  });
});
