import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { Router } from "express";

import { createIntegrationTestApp } from "../../test-utils/create-integration-test-app.js";
import { requireAuth } from "../../middlewares/auth-middleware.js";
import { eventBus } from "../../shared/events/event-bus.js";
import { tokenService } from "../auth/services/token.service.js";
import { GetSettingsUseCase } from "./application/use-cases/get-settings.use-case.js";
import { UpdateSettingsUseCase } from "./application/use-cases/update-settings.use-case.js";
import type { UserSettingsEntity } from "./domain/entities/user-settings.entity.js";
import type { UserSettingsRepository } from "./domain/repositories/user-settings.repository.js";
import { SettingsController } from "./infrastructure/http/controllers/settings.controller.js";

class InMemorySettingsRepository implements UserSettingsRepository {
  private settings = new Map<string, UserSettingsEntity>();

  async findByUserId(userId: string) {
    return this.settings.get(userId) ?? null;
  }

  async createDefault(userId: string) {
    const settings: UserSettingsEntity = {
      id: `settings_${userId}`,
      userId,
      theme: "dark",
      jobRefreshFrequency: "1h",
      dashboardNotificationInterval: "1h",
      showCompatibleJobsOnly: false,
      showSalaryWhenAvailable: true,
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(userId, settings);
    return settings;
  }

  async update(userId: string, input: Partial<UserSettingsEntity>) {
    const existing = this.settings.get(userId);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(userId, updated);
    return updated;
  }

  reset(): void {
    this.settings.clear();
  }
}

const createTestSettingsRoutes = (repository: InMemorySettingsRepository) => {
  const router = Router();
  const controller = new SettingsController(
    new GetSettingsUseCase(repository),
    new UpdateSettingsUseCase(repository, eventBus),
  );

  router.use(requireAuth);
  router.get("/", controller.getSettings);
  router.patch("/", controller.updateSettings);

  return router;
};

describe("Settings module integration", () => {
  const repository = new InMemorySettingsRepository();
  const userId = "user_test_settings";
  const email = "settings@test.com";
  let app = createIntegrationTestApp((expressApp) => {
    expressApp.use("/settings", createTestSettingsRoutes(repository));
  });

  beforeEach(() => {
    repository.reset();
    app = createIntegrationTestApp((expressApp) => {
      expressApp.use("/settings", createTestSettingsRoutes(repository));
    });
  });

  const authCookie = () => {
    const token = tokenService.signAccessToken({ userId, email });
    return `jt_access=${token}`;
  };

  it("GET /settings returns default settings", async () => {
    const response = await request(app).get("/settings").set("Cookie", authCookie());

    expect(response.status).toBe(200);
    expect(response.body.data.theme).toBe("dark");
  });

  it("PATCH /settings updates theme", async () => {
    await request(app).get("/settings").set("Cookie", authCookie());

    const response = await request(app)
      .patch("/settings")
      .set("Cookie", authCookie())
      .send({ theme: "light" });

    expect(response.status).toBe(200);
    expect(response.body.data.theme).toBe("light");
  });
});
