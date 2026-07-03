export type DashboardKpi = {
  id: string;
  label: string;
  value: number;
  change: number;
  changeLabel: string;
};

export type DashboardChartPoint = {
  label: string;
  value: number;
};

export type DashboardActivityType =
  | "job"
  | "application"
  | "interview"
  | "match"
  | "favorite"
  | "status_change";

export type DashboardActivity = {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  occurredAt: string;
};

export type DashboardInterview = {
  id: string;
  applicationId: string;
  jobTitle: string;
  companyName: string;
  scheduledAt: string;
  stage: string;
  status: string;
};

export type DashboardInsight = {
  title: string;
  message: string;
  highlight?: string;
  trendPercent?: number;
};

export type DashboardJobSync = {
  lastSyncAt: string | null;
  totalCatalogJobs: number;
  jobsByProvider: Array<{ provider: string; count: number }>;
  providerErrors24h: number;
  expiredJobsCount: number;
  closedJobsCount: number;
  newJobsSinceLastSync: number;
  newCompaniesCount: number;
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

export type DashboardData = {
  kpis: DashboardKpi[];
  jobsByArea: DashboardChartPoint[];
  applicationsByStage: DashboardChartPoint[];
  topTechnologies: DashboardChartPoint[];
  topCompanies: DashboardChartPoint[];
  recentActivities: DashboardActivity[];
  upcomingInterviews: DashboardInterview[];
  insight: DashboardInsight;
  applicationsTimeline: DashboardChartPoint[];
  jobSync: DashboardJobSync;
  generatedAt: string;
};
