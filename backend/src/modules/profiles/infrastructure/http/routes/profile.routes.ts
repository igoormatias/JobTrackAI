import { Router } from "express";

import { logger } from "../../../../../config/logger.js";
import { requireAuth } from "../../../../../middlewares/auth-middleware.js";
import { eventBus } from "../../../../../shared/events/event-bus.js";
import { CreateProfileUseCase } from "../../../application/use-cases/create-profile.use-case.js";
import { GetProfileUseCase } from "../../../application/use-cases/get-profile.use-case.js";
import { UpdateProfileUseCase } from "../../../application/use-cases/update-profile.use-case.js";
import { prismaProfileRepository } from "../../repositories/prisma-profile.repository.js";
import { ProfileUpdatedEvent } from "../../../domain/events/profile-updated.event.js";
import { ProfileController } from "../controllers/profile.controller.js";

const registerProfileEventHandlers = (): void => {
  eventBus.subscribe("ProfileUpdated", async (event) => {
    if (event instanceof ProfileUpdatedEvent) {
      logger.debug({ userId: event.payload.userId }, "Profile updated");
    }
  });
};

export const createProfileRoutes = (): Router => {
  registerProfileEventHandlers();

  const router = Router();
  const getProfileUseCase = new GetProfileUseCase(prismaProfileRepository);
  const createProfileUseCase = new CreateProfileUseCase(prismaProfileRepository, eventBus);
  const updateProfileUseCase = new UpdateProfileUseCase(prismaProfileRepository, eventBus);
  const controller = new ProfileController(
    getProfileUseCase,
    createProfileUseCase,
    updateProfileUseCase,
  );

  router.use(requireAuth);
  router.get("/", controller.getProfile);
  router.post("/", controller.createProfile);
  router.patch("/", controller.updateProfile);

  return router;
};
