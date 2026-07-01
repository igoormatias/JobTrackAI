import { z } from "zod";

const chartPointSchema = z.object({
  label: z.string(),
  value: z.number(),
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
      jobTitle: z.string(),
      companyName: z.string(),
      scheduledAt: z.string(),
      stage: z.string(),
      status: z.string(),
    }),
  ),
  topTechnologies: z.array(chartPointSchema),
  topCompanies: z.array(chartPointSchema),
  generatedAt: z.string(),
});

export type DashboardDataSchema = z.infer<typeof dashboardDataSchema>;
