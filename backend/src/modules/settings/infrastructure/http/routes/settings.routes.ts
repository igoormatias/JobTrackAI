import { Router } from "express";

import { logger } from "../../../../../config/logger.js";
import { requireAuth } from "../../../../../middlewares/auth-middleware.js";
import { eventBus } from "../../../../../shared/events/event-bus.js";
import { GetSettingsUseCase } from "../../../application/use-cases/get-settings.use-case.js";
import { UpdateSettingsUseCase } from "../../../application/use-cases/update-settings.use-case.js";
import { prismaUserSettingsRepository } from "../../repositories/prisma-user-settings.repository.js";
import { SettingsUpdatedEvent } from "../../../domain/events/settings-updated.event.js";
import { SettingsController } from "../controllers/settings.controller.js";

const registerSettingsEventHandlers = (): void => {
  eventBus.subscribe("SettingsUpdated", async (event) => {
    if (event instanceof SettingsUpdatedEvent) {
      logger.debug({ userId: event.payload.userId }, "Settings updated");
    }
  });
};

export const createSettingsRoutes = (): Router => {
  registerSettingsEventHandlers();

  const router = Router();
  const getSettingsUseCase = new GetSettingsUseCase(prismaUserSettingsRepository);
  const updateSettingsUseCase = new UpdateSettingsUseCase(prismaUserSettingsRepository, eventBus);
  const controller = new SettingsController(getSettingsUseCase, updateSettingsUseCase);

  router.use(requireAuth);
  router.get("/", controller.getSettings);
  router.patch("/", controller.updateSettings);

  return router;
};
