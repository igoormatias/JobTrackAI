import { Router } from "express";

import { requireAuth } from "../../../../../middlewares/auth-middleware.js";
import { ConnectGoogleCalendarUseCase } from "../../../application/use-cases/connect-google-calendar.use-case.js";
import { DisconnectCalendarUseCase } from "../../../application/use-cases/disconnect-calendar.use-case.js";
import { GetCalendarStatusUseCase } from "../../../application/use-cases/get-calendar-status.use-case.js";
import { GetGoogleCalendarAuthUrlUseCase } from "../../../application/use-cases/get-google-calendar-auth-url.use-case.js";
import { ListCalendarEventsUseCase } from "../../../application/use-cases/list-calendar-events.use-case.js";
import { DismissCalendarPromptUseCase } from "../../../application/use-cases/dismiss-calendar-prompt.use-case.js";
import { googleCalendarProvider } from "../../providers/google-calendar.provider.js";
import { prismaCalendarIntegrationRepository } from "../../repositories/prisma-calendar-integration.repository.js";
import { CalendarController } from "../controllers/calendar.controller.js";

export const createCalendarRoutes = (): Router => {
  const router = Router();
  const repository = prismaCalendarIntegrationRepository;
  const provider = googleCalendarProvider;

  const controller = new CalendarController(
    new GetCalendarStatusUseCase(repository),
    new GetGoogleCalendarAuthUrlUseCase(provider),
    new ConnectGoogleCalendarUseCase(repository, provider),
    new DisconnectCalendarUseCase(repository),
    new ListCalendarEventsUseCase(repository, provider),
    new DismissCalendarPromptUseCase(),
  );

  router.use(requireAuth);
  router.get("/status", controller.getStatus);
  router.get("/google/auth-url", controller.getGoogleAuthUrl);
  router.post("/google/callback", controller.connectGoogle);
  router.delete("/google/disconnect", controller.disconnectGoogle);
  router.get("/events", controller.listEvents);
  router.post("/dismiss-prompt", controller.dismissPrompt);

  return router;
};
