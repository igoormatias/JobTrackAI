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
    const now = Date.now();
    const horizonEnd = new Date(now + 90 * 86_400_000).toISOString();
    const allUpcoming = await this.careerEvents.listEvents(userId, new Date().toISOString(), horizonEnd);
    const futureEvents = allUpcoming
      .filter((event) => new Date(event.start).getTime() >= now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const upcoming = futureEvents.slice(0, 5);
    const weekAhead = now + 7 * 86_400_000;
    const interviewsFutureTotal = futureEvents.length;
    const interviewsNextWeek = futureEvents.filter(
      (event) => new Date(event.start).getTime() <= weekAhead,
    ).length;

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

    const kpis = data.kpis.map((kpi) =>
      kpi.id === "kpi_interviews"
        ? {
            ...kpi,
            value: interviewsFutureTotal,
            change: interviewsNextWeek,
            changeLabel: "próximos 7 dias",
          }
        : kpi,
    );

    return {
      data: {
        ...data,
        kpis,
        upcomingInterviews,
      },
    };
  }
}
