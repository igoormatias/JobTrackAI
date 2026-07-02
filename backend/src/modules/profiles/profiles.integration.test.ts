import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { Router } from "express";

import { createIntegrationTestApp } from "../../test-utils/create-integration-test-app.js";
import { requireAuth } from "../../middlewares/auth-middleware.js";
import { eventBus } from "../../shared/events/event-bus.js";
import { tokenService } from "../auth/services/token.service.js";
import { CreateProfileUseCase } from "./application/use-cases/create-profile.use-case.js";
import { GetProfileUseCase } from "./application/use-cases/get-profile.use-case.js";
import { UpdateProfileUseCase } from "./application/use-cases/update-profile.use-case.js";
import { ProfileController } from "./infrastructure/http/controllers/profile.controller.js";
import { InMemoryProfileRepository } from "./infrastructure/repositories/in-memory-profile.repository.js";

const createTestProfileRoutes = (repository: InMemoryProfileRepository) => {
  const router = Router();
  const controller = new ProfileController(
    new GetProfileUseCase(repository),
    new CreateProfileUseCase(repository, eventBus),
    new UpdateProfileUseCase(repository, eventBus),
  );

  router.use(requireAuth);
  router.get("/", controller.getProfile);
  router.post("/", controller.createProfile);
  router.patch("/", controller.updateProfile);

  return router;
};

describe("Profiles module integration", () => {
  const repository = new InMemoryProfileRepository();
  const userId = "user_test_profile";
  const email = "profile@test.com";
  let app = createIntegrationTestApp((expressApp) => {
    expressApp.use("/profile", createTestProfileRoutes(repository));
  });

  beforeEach(() => {
    repository.reset();
    repository.seedUser(userId, {
      name: "Profile User",
      email,
      avatarUrl: null,
    });

    app = createIntegrationTestApp((expressApp) => {
      expressApp.use("/profile", createTestProfileRoutes(repository));
    });
  });

  const authCookie = () => {
    const token = tokenService.signAccessToken({ userId, email });
    return `jt_access=${token}`;
  };

  it("GET /profile returns profile with user", async () => {
    await repository.create(userId, { area: "frontend", skillNames: ["React"] });

    const response = await request(app).get("/profile").set("Cookie", authCookie());

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.area).toBe("frontend");
  });

  it("PATCH /profile updates profile", async () => {
    await repository.create(userId, { area: "frontend", skillNames: ["React"] });

    const response = await request(app)
      .patch("/profile")
      .set("Cookie", authCookie())
      .send({ seniority: "senior" });

    expect(response.status).toBe(200);
    expect(response.body.data.seniority).toBe("senior");
  });
});
