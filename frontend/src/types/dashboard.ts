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

export type DashboardActivity = {
  id: string;
  type: "job" | "application" | "interview" | "match";
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
};

export type DashboardData = {
  kpis: DashboardKpi[];
  jobsByArea: DashboardChartPoint[];
  applicationsByStage: DashboardChartPoint[];
  topTechnologies: DashboardChartPoint[];
  topCompanies: DashboardChartPoint[];
  recentActivities: DashboardActivity[];
  upcomingInterviews: DashboardInterview[];
  generatedAt: string;
};
