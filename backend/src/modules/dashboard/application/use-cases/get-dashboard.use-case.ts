import type { UseCase } from "../../../../shared/application/use-case.js";
import type { CalendarProviderPort } from "../../../calendar/domain/ports/calendar-provider.port.js";
import type { CalendarIntegrationRepository } from "../../../calendar/domain/repositories/calendar-integration.repository.js";
import { CareerEventsService } from "../../../calendar/application/services/career-events.service.js";
import type { DashboardRepository } from "../../domain/repositories/dashboard.repository.js";
import type { DashboardInterviewDto, DashboardResponseDto } from "../dto/dashboard-response.dto.js";

export class GetDashboardUseCase implements UseCase<string, DashboardResponseDto> {
  private readonly careerEvents: CareerEventsService;

  constructor(
    private readonly dashboardRepository: DashboardRepository,
    repository: CalendarIntegrationRepository,
    provider: CalendarProviderPort,
  ) {
    this.careerEvents = new CareerEventsService(repository, provider);
  }

  async execute(userId: string): Promise<DashboardResponseDto> {
    const data = await this.dashboardRepository.getDashboardData(userId);
    const upcoming = await this.careerEvents.getUpcomingEvents(userId, 5);

    const upcomingInterviews: DashboardInterviewDto[] = upcoming.map((event) => ({
      id: event.id,
      applicationId: event.trackingId ?? event.id,
      trackingId: event.trackingId ?? null,
      jobTitle: event.jobTitle ?? event.summary,
      companyName: event.companyName ?? "—",
      scheduledAt: event.start,
      stage: event.stage ?? "—",
      status: event.stage ?? event.source,
      meetingType: event.meetingType ?? null,
      location: event.location,
      source: event.source,
      link: event.htmlLink,
    }));

    return {
      data: {
        ...data,
        upcomingInterviews,
      },
    };
  }
}
