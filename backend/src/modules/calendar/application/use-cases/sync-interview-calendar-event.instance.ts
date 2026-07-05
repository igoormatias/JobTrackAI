import { SyncInterviewCalendarEventUseCase } from "./sync-interview-calendar-event.use-case.js";
import { googleCalendarProvider } from "../../infrastructure/providers/google-calendar.provider.js";
import { prismaCalendarIntegrationRepository } from "../../infrastructure/repositories/prisma-calendar-integration.repository.js";

export const syncInterviewCalendarEventUseCase = new SyncInterviewCalendarEventUseCase(
  prismaCalendarIntegrationRepository,
  googleCalendarProvider,
);
