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

export type DashboardCompanyInsightDto = {
  label: string;
  totalJobs: number;
  inProgress: number;
  favorites: number;
  lastInteractionAt: string;
  bestMatchScore: number;
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
  trackingId: string | null;
  jobTitle: string;
  companyName: string;
  scheduledAt: string;
  stage: string;
  status: string;
  meetingType: string | null;
  location: string | null;
  source: "interview" | "google";
  link: string | null;
};

export type DashboardInsightDto = {
  title: string;
  message: string;
  highlight?: string;
  trendPercent?: number;
};

export type DashboardProviderHealthDto = {
  provider: string;
  displayName: string;
  enabled: boolean;
  status: string;
  lastRunAt: string | null;
  lastHealthAt: string | null;
};

export type DashboardJobSyncDto = {
  lastSyncAt: string | null;
  totalCatalogJobs: number;
  jobsByProvider: Array<{ provider: string; count: number }>;
  providerErrors24h: number;
  expiredJobsCount: number;
  closedJobsCount: number;
  newJobsSinceLastSync: number;
  newCompaniesCount: number;
  providerHealth: DashboardProviderHealthDto[];
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

export type DashboardTopJobDto = {
  id: string;
  title: string;
  companyName: string;
  companySlug: string | null;
  modality: string | null;
  location: string | null;
  source: string;
  sourceUrl: string | null;
  matchScore: number;
  matchLabel: string;
  reasons: Array<{ id: string; label: string; matched: boolean }>;
  publishedAt: string;
};

export type DashboardDataDto = {
  kpis: DashboardKpiDto[];
  jobsByArea: DashboardChartPointDto[];
  applicationsByStage: DashboardChartPointDto[];
  topTechnologies: DashboardChartPointDto[];
  topCompanies: DashboardCompanyInsightDto[];
  /** Highly compatible jobs only (match >= 60). Empty when none. */
  topJobs: DashboardTopJobDto[];
  recentActivities: DashboardActivityDto[];
  upcomingInterviews: DashboardInterviewDto[];
  insight: DashboardInsightDto;
  applicationsTimeline: DashboardChartPointDto[];
  jobSync: DashboardJobSyncDto;
  hasCalendarIntegration: boolean;
  generatedAt: string;
};

export type DashboardResponseDto = {
  data: DashboardDataDto;
};
