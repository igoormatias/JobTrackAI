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
  generatedAt: string;
};
