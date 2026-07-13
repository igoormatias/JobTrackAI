import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DashboardDataDto } from "../dto/dashboard-response.dto.js";
import { GetDashboardUseCase } from "./get-dashboard.use-case.js";

const mockListEvents = vi.fn();

vi.mock("../../../../config/logger.js", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("../../../calendar/application/services/career-events.service.js", () => ({
  CareerEventsService: vi.fn().mockImplementation(() => ({
    listEvents: (...args: unknown[]) => mockListEvents(...args),
  })),
}));

const baseDashboardData = (): DashboardDataDto => ({
  kpis: [
    {
      id: "kpi_interviews",
      label: "Entrevistas",
      value: 0,
      change: 0,
      changeLabel: "próximos 7 dias",
    },
    {
      id: "kpi_favorites",
      label: "Favoritas",
      value: 2,
      change: 1,
      changeLabel: "com alta prioridade",
    },
  ],
  jobsByArea: [],
  applicationsByStage: [{ label: "Aplicada", value: 1 }],
  topTechnologies: [],
  topCompanies: [],
  topJobs: [],
  recentActivities: [],
  upcomingInterviews: [],
  insight: { title: "Insight", message: "ok" },
  applicationsTimeline: [],
  jobSync: {
    lastSyncAt: null,
    totalCatalogJobs: 0,
    jobsByProvider: [],
    providerErrors24h: 0,
    expiredJobsCount: 0,
    closedJobsCount: 0,
    newJobsSinceLastSync: 0,
    newCompaniesCount: 0,
    providerHealth: [],
    recentExecutions: [],
  },
  hasCalendarIntegration: true,
  generatedAt: new Date().toISOString(),
});

describe("GetDashboardUseCase", () => {
  const dashboardRepository = {
    getDashboardData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    dashboardRepository.getDashboardData.mockResolvedValue(baseDashboardData());
  });

  it("should return dashboard data when career events load successfully", async () => {
    const start = new Date(Date.now() + 86_400_000).toISOString();
    mockListEvents.mockResolvedValue([
      {
        id: "interview_1",
        summary: "Entrevista · Frontend",
        description: null,
        location: null,
        htmlLink: null,
        start,
        end: start,
        source: "interview",
        trackingId: "trk_1",
        jobTitle: "Frontend",
        companyName: "Acme",
        stage: "Aplicada",
        meetingType: null,
      },
    ]);

    const useCase = new GetDashboardUseCase(
      dashboardRepository as never,
      {} as never,
      {} as never,
    );
    const result = await useCase.execute("user-1");

    expect(result.data.upcomingInterviews).toHaveLength(1);
    expect(result.data.upcomingInterviews[0]?.jobTitle).toBe("Frontend");
    expect(result.data.kpis.find((kpi) => kpi.id === "kpi_interviews")?.value).toBe(1);
    expect(mockListEvents).toHaveBeenCalledWith(
      "user-1",
      expect.any(Date),
      expect.any(Date),
      { degradeOnProviderFailure: true },
    );
  });

  it("should still return dashboard data when career events fail", async () => {
    mockListEvents.mockRejectedValue(new Error("Google Calendar down"));

    const useCase = new GetDashboardUseCase(
      dashboardRepository as never,
      {} as never,
      {} as never,
    );
    const result = await useCase.execute("user-1");

    expect(result.data.applicationsByStage).toEqual([{ label: "Aplicada", value: 1 }]);
    expect(result.data.upcomingInterviews).toEqual([]);
    expect(result.data.kpis.find((kpi) => kpi.id === "kpi_interviews")?.value).toBe(0);
    expect(result.data.kpis.find((kpi) => kpi.id === "kpi_favorites")?.value).toBe(2);
  });
});
