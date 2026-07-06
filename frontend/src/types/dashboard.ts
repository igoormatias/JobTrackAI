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

export type DashboardCompanyInsight = {
  label: string;
  totalJobs: number;
  inProgress: number;
  favorites: number;
  lastInteractionAt: string;
  bestMatchScore: number;
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

export type DashboardProviderHealth = {
  provider: string;
  displayName: string;
  enabled: boolean;
  status: string;
  lastRunAt: string | null;
  lastHealthAt: string | null;
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
  providerHealth: DashboardProviderHealth[];
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
  topCompanies: DashboardCompanyInsight[];
  recentActivities: DashboardActivity[];
  upcomingInterviews: DashboardInterview[];
  insight: DashboardInsight;
  applicationsTimeline: DashboardChartPoint[];
  jobSync: DashboardJobSync;
  hasCalendarIntegration: boolean;
  generatedAt: string;
};
