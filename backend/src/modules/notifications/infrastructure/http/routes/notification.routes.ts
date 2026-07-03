import { Router } from "express";

import { requireAuth } from "../../../../../middlewares/auth-middleware.js";
import { eventBus } from "../../../../../shared/events/event-bus.js";
import { NotificationEventHandler } from "../../../application/notification-event.handler.js";
import { NotificationService } from "../../../application/notification.service.js";
import { prismaNotificationRepository } from "../../repositories/prisma-notification.repository.js";
import { NotificationController } from "../controllers/notification.controller.js";

const registerNotificationEventHandlers = (): void => {
  const notificationService = new NotificationService(prismaNotificationRepository, eventBus);
  const handler = new NotificationEventHandler(notificationService);
  handler.register(eventBus);
};

export const createNotificationRoutes = (): Router => {
  registerNotificationEventHandlers();

  const router = Router();
  const notificationService = new NotificationService(prismaNotificationRepository, eventBus);
  const controller = new NotificationController(notificationService);

  router.use(requireAuth);
  router.get("/", controller.listNotifications);
  router.patch("/read", controller.markAsRead);

  return router;
};
