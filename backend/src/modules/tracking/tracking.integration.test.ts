import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { Router } from "express";

import { createIntegrationTestApp } from "../../test-utils/create-integration-test-app.js";
import { requireAuth } from "../../middlewares/auth-middleware.js";
import { tokenService } from "../auth/services/token.service.js";
import { TrackingController } from "./infrastructure/http/controllers/tracking.controller.js";
import { TrackingService } from "./application/tracking.service.js";
import { InMemoryJobTrackingRepository } from "./infrastructure/repositories/in-memory-job-tracking.repository.js";

const createTestTrackingRoutes = (service: TrackingService) => {
  const router = Router();
  const controller = new TrackingController(service);
  router.use(requireAuth);
  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id/stage", controller.moveStage);
  router.patch("/:id/favorite", controller.toggleFavorite);
  return router;
};

describe("Tracking module integration", () => {
  let repository: InMemoryJobTrackingRepository;
  let service: TrackingService;

  const userA = "user_0001";
  const userB = "user_0002";
  const emailA = "tracking-a@test.com";
  const emailB = "tracking-b@test.com";

  beforeEach(() => {
    repository = new InMemoryJobTrackingRepository();
    repository.reset();
    repository["trackings"] = [];
    service = new TrackingService(repository);
  });

  const authCookie = (userId: string, email: string) => {
    const token = tokenService.signAccessToken({ userId, email });
    return `jt_access=${token}`;
  };

  it("POST /tracking creates manual process", async () => {
    const app = createIntegrationTestApp((expressApp) => {
      expressApp.use("/tracking", createTestTrackingRoutes(service));
    });

    const response = await request(app)
      .post("/tracking")
      .set("Cookie", authCookie(userA, emailA))
      .send({
        job: {
          companyName: "Acme",
          title: "Developer",
          source: "manual",
        },
        stage: "applied",
        stageOccurredAt: new Date().toISOString(),
      });

    expect(response.status).toBe(201);
    expect(response.body.data.stage).toBe("applied");
  });

  it("GET /tracking lists active trackings", async () => {
    const app = createIntegrationTestApp((expressApp) => {
      expressApp.use("/tracking", createTestTrackingRoutes(service));
    });

    await request(app)
      .post("/tracking")
      .set("Cookie", authCookie(userA, emailA))
      .send({
        job: { companyName: "Acme", title: "Dev", source: "manual" },
        stage: "discovery",
        stageOccurredAt: new Date().toISOString(),
      });

    const response = await request(app).get("/tracking").set("Cookie", authCookie(userA, emailA));
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
  });

  it("denies access to another user's tracking (IDOR)", async () => {
    const app = createIntegrationTestApp((expressApp) => {
      expressApp.use("/tracking", createTestTrackingRoutes(service));
    });

    const created = await request(app)
      .post("/tracking")
      .set("Cookie", authCookie(userA, emailA))
      .send({
        job: { companyName: "Acme", title: "Dev", source: "manual" },
        stage: "discovery",
        stageOccurredAt: new Date().toISOString(),
      });

    const trackingId = created.body.data.id as string;

    const getResponse = await request(app)
      .get(`/tracking/${trackingId}`)
      .set("Cookie", authCookie(userB, emailB));
    expect(getResponse.status).toBe(404);

    const moveResponse = await request(app)
      .patch(`/tracking/${trackingId}/stage`)
      .set("Cookie", authCookie(userB, emailB))
      .send({ stage: "applied", occurredAt: new Date().toISOString() });
    expect(moveResponse.status).toBe(404);
  });
});
