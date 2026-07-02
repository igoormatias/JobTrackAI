import { Router } from "express";

import { logger } from "../../../../../config/logger.js";
import { eventBus } from "../../../../../shared/events/event-bus.js";
import { GetHealthUseCase } from "../../../application/use-cases/get-health.use-case.js";
import { GetInfoUseCase } from "../../../application/use-cases/get-info.use-case.js";
import { GetVersionUseCase } from "../../../application/use-cases/get-version.use-case.js";
import { staticSystemInfoRepository } from "../../repositories/static-system-info.repository.js";
import { SystemController } from "../controllers/system.controller.js";

const registerSystemEventHandlers = (): void => {
  eventBus.subscribe("SystemHealthChecked", async (event) => {
    logger.debug({ event: event.eventName }, "System health checked");
  });
};

export const createSystemRoutes = (): Router => {
  registerSystemEventHandlers();

  const router = Router();

  const getHealthUseCase = new GetHealthUseCase(staticSystemInfoRepository, eventBus);
  const getVersionUseCase = new GetVersionUseCase(staticSystemInfoRepository);
  const getInfoUseCase = new GetInfoUseCase(staticSystemInfoRepository);

  const controller = new SystemController(
    getHealthUseCase,
    getVersionUseCase,
    getInfoUseCase,
  );

  router.get("/health", controller.getHealth);
  router.get("/version", controller.getVersion);
  router.get("/info", controller.getInfo);

  return router;
};
