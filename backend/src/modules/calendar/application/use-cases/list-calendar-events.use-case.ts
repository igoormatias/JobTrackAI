import type { CareerEvent } from "../services/career-events.service.js";
import type { CalendarProviderPort } from "../../domain/ports/calendar-provider.port.js";
import type { CalendarIntegrationRepository } from "../../domain/repositories/calendar-integration.repository.js";
import { CareerEventsService } from "../services/career-events.service.js";

export class ListCalendarEventsUseCase {
  private readonly careerEvents: CareerEventsService;

  constructor(
    repository: CalendarIntegrationRepository,
    provider: CalendarProviderPort,
  ) {
    this.careerEvents = new CareerEventsService(repository, provider);
  }

  async execute(userId: string, from: Date, to: Date) {
    const events = await this.careerEvents.listEvents(userId, from, to);
    return { events };
  }
}

export const mapCareerEventToCalendarDto = (event: CareerEvent) => ({
  id: event.id,
  summary: event.summary,
  description: event.description,
  location: event.location,
  htmlLink: event.htmlLink,
  start: event.start,
  end: event.end,
  source: event.source,
  trackingId: event.trackingId ?? null,
  jobTitle: event.jobTitle ?? null,
  companyName: event.companyName ?? null,
  stage: event.stage ?? null,
  meetingType: event.meetingType ?? null,
});
