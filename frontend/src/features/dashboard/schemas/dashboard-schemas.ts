import { z } from "zod";

const chartPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});

const companyInsightSchema = z.object({
  label: z.string(),
  totalJobs: z.number(),
  inProgress: z.number(),
  favorites: z.number(),
  lastInteractionAt: z.string(),
  bestMatchScore: z.number(),
});

export const dashboardDataSchema = z.object({
  kpis: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      value: z.number(),
      change: z.number(),
      changeLabel: z.string(),
    }),
  ),
  insight: z.object({
    title: z.string(),
    message: z.string(),
    highlight: z.string().optional(),
    trendPercent: z.number().optional(),
  }),
  applicationsTimeline: z.array(chartPointSchema),
  recentActivities: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["job", "application", "interview", "match", "favorite", "status_change"]),
      title: z.string(),
      description: z.string(),
      occurredAt: z.string(),
    }),
  ),
  upcomingInterviews: z.array(
    z.object({
      id: z.string(),
      applicationId: z.string(),
      trackingId: z.string().nullable().optional(),
      jobTitle: z.string(),
      companyName: z.string(),
      scheduledAt: z.string(),
      stage: z.string(),
      status: z.string(),
      meetingType: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      source: z.enum(["interview", "google"]).optional(),
      link: z.string().nullable(),
    }),
  ),
  topTechnologies: z.array(chartPointSchema),
  topCompanies: z.array(companyInsightSchema),
  jobSync: z.object({
    lastSyncAt: z.string().nullable(),
    totalCatalogJobs: z.number(),
    jobsByProvider: z.array(
      z.object({
        provider: z.string(),
        count: z.number(),
      }),
    ),
    providerErrors24h: z.number(),
    expiredJobsCount: z.number(),
    closedJobsCount: z.number(),
    newJobsSinceLastSync: z.number(),
    newCompaniesCount: z.number(),
    providerHealth: z.array(
      z.object({
        provider: z.string(),
        displayName: z.string(),
        enabled: z.boolean(),
        status: z.string(),
        lastRunAt: z.string().nullable(),
        lastHealthAt: z.string().nullable(),
      }),
    ),
    recentExecutions: z.array(
      z.object({
        id: z.string(),
        providerName: z.string(),
        status: z.string(),
        startedAt: z.string(),
        finishedAt: z.string().nullable(),
        importedCount: z.number(),
        duplicateCount: z.number(),
        failedCount: z.number(),
        errorMessage: z.string().nullable(),
      }),
    ),
  }),
  hasCalendarIntegration: z.boolean(),
  generatedAt: z.string(),
});

export type DashboardDataSchema = z.infer<typeof dashboardDataSchema>;
