export type DashboardKpiDto = {
  id: string;
  label: string;
  value: number;
  change: number;
  changeLabel: string;
};

export type DashboardChartPointDto = {
  label: string;
  value: number;
};

export type DashboardActivityTypeDto =
  | "job"
  | "application"
  | "interview"
  | "match"
  | "favorite"
  | "status_change";

export type DashboardActivityDto = {
  id: string;
  type: DashboardActivityTypeDto;
  title: string;
  description: string;
  occurredAt: string;
};

export type DashboardInterviewDto = {
  id: string;
  applicationId: string;
  jobTitle: string;
  companyName: string;
  scheduledAt: string;
  stage: string;
  status: string;
};

export type DashboardInsightDto = {
  title: string;
  message: string;
  highlight?: string;
  trendPercent?: number;
};

export type DashboardJobSyncDto = {
  lastSyncAt: string | null;
  totalCatalogJobs: number;
  jobsByProvider: Array<{ provider: string; count: number }>;
  providerErrors24h: number;
  recentExecutions: Array<{
    id: string;
    providerName: string;
    status: string;
    startedAt: string;
    finishedAt: string | null;
    importedCount: number;
    duplicateCount: number;
    failedCount: number;
    errorMessage: string | null;
  }>;
};

export type DashboardDataDto = {
  kpis: DashboardKpiDto[];
  jobsByArea: DashboardChartPointDto[];
  applicationsByStage: DashboardChartPointDto[];
  topTechnologies: DashboardChartPointDto[];
  topCompanies: DashboardChartPointDto[];
  recentActivities: DashboardActivityDto[];
  upcomingInterviews: DashboardInterviewDto[];
  insight: DashboardInsightDto;
  applicationsTimeline: DashboardChartPointDto[];
  jobSync: DashboardJobSyncDto;
  generatedAt: string;
};

export type DashboardResponseDto = {
  data: DashboardDataDto;
};
