export { createCalendarRoutes } from "./infrastructure/http/routes/calendar.routes.js";
export { CalendarController } from "./infrastructure/http/controllers/calendar.controller.js";
export { ConnectGoogleCalendarUseCase } from "./application/use-cases/connect-google-calendar.use-case.js";
export { DisconnectCalendarUseCase } from "./application/use-cases/disconnect-calendar.use-case.js";
export { GetCalendarStatusUseCase } from "./application/use-cases/get-calendar-status.use-case.js";
export { SyncInterviewCalendarEventUseCase } from "./application/use-cases/sync-interview-calendar-event.use-case.js";
export { GoogleCalendarProvider } from "./infrastructure/providers/google-calendar.provider.js";
export { prismaCalendarIntegrationRepository } from "./infrastructure/repositories/prisma-calendar-integration.repository.js";

import { SyncInterviewCalendarEventUseCase } from "./application/use-cases/sync-interview-calendar-event.use-case.js";
import { googleCalendarProvider } from "./infrastructure/providers/google-calendar.provider.js";
import { prismaCalendarIntegrationRepository } from "./infrastructure/repositories/prisma-calendar-integration.repository.js";

export const syncInterviewCalendarEventUseCase = new SyncInterviewCalendarEventUseCase(
  prismaCalendarIntegrationRepository,
  googleCalendarProvider,
);
