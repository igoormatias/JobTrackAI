import type { Application, DashboardData, DashboardInsight, Job } from "@/types";

import { buildApplicationsTimeline, buildPersonalizedDashboard } from "@/features/recommendations/utils/dashboard-builder";
import type { RecommendationProfile } from "@/features/recommendations/types/recommendation.types";

import { PIPELINE_STAGE_LABELS, PROFESSIONAL_AREAS } from "../constants/mock-data";

export type CreateDashboardInput = {
  jobs: Job[];
  applications: Application[];
  profile?: RecommendationProfile;
};

const countBy = <T>(items: T[], getKey: (item: T) => string): Record<string, number> =>
  items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

export const createDashboard = ({ jobs, applications, profile }: CreateDashboardInput): DashboardData => {
  if (profile) {
    return buildPersonalizedDashboard({ jobs, applications, profile });
  }

  const favoriteJobs = jobs.filter((job) => job.isFavorite);
  const areaCounts = countBy(jobs, (job) => job.area);
  const stageCounts = countBy(applications, (app) => app.stage);
  const techCounts = countBy(
    jobs.flatMap((job) => job.technologies),
    (tech) => tech.name,
  );
  const companyCounts = countBy(jobs, (job) => job.company.name);

  const topEntries = (record: Record<string, number>, limit = 5) =>
    Object.entries(record)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([label, value]) => ({ label, value }));

  const upcomingInterviews = applications
    .filter((app) => app.nextInterviewAt)
    .slice(0, 5)
    .map((app) => ({
      id: `interview_${app.id}`,
      applicationId: app.id,
      jobTitle: app.job.title,
      companyName: app.job.company.name,
      scheduledAt: app.nextInterviewAt!,
      stage: PIPELINE_STAGE_LABELS[app.stage],
      status: PIPELINE_STAGE_LABELS[app.stage],
    }));

  const newJobsCount = jobs.filter((job) => new Date(job.publishedAt) > new Date(Date.now() - 7 * 86400000)).length;

  const insight: DashboardInsight = {
    title: "Insight da semana",
    message: `Encontramos ${newJobsCount} novas vagas esta semana. Continuaremos monitorando oportunidades compatíveis com seu perfil.`,
    highlight: "mercado",
    trendPercent: 12,
  };

  return {
    kpis: [
      {
        id: "kpi_new_jobs",
        label: "Novas vagas",
        value: jobs.filter((job) => new Date(job.publishedAt) > new Date(Date.now() - 7 * 86400000)).length,
        change: 12,
        changeLabel: "vs. semana anterior",
      },
      {
        id: "kpi_high_match",
        label: "Match acima de 90%",
        value: jobs.filter((job) => job.matchScore.score >= 90).length,
        change: 8,
        changeLabel: "≥ 90%",
      },
      {
        id: "kpi_favorites",
        label: "Favoritas",
        value: favoriteJobs.length,
        change: 3,
        changeLabel: "ativas",
      },
      {
        id: "kpi_applications",
        label: "Aplicações",
        value: applications.length,
        change: 5,
        changeLabel: "em andamento",
      },
      {
        id: "kpi_interviews",
        label: "Entrevistas",
        value: upcomingInterviews.length,
        change: 2,
        changeLabel: "próximos 7 dias",
      },
    ],
    jobsByArea: PROFESSIONAL_AREAS.map((area) => ({
      label: area.replace("_", " "),
      value: areaCounts[area] ?? 0,
    })).filter((item) => item.value > 0),
    applicationsByStage: Object.entries(stageCounts).map(([stage, value]) => ({
      label: PIPELINE_STAGE_LABELS[stage as keyof typeof PIPELINE_STAGE_LABELS] ?? stage,
      value,
    })),
    topTechnologies: topEntries(techCounts),
    topCompanies: topEntries(companyCounts),
    recentActivities: [
      ...jobs.slice(0, 3).map((job, index) => ({
        id: `activity_job_${index}`,
        type: "job" as const,
        title: job.title,
        description: `${job.company.name} · ${job.matchScore.score}% match`,
        occurredAt: job.publishedAt,
      })),
      ...applications.slice(0, 3).map((app, index) => ({
        id: `activity_app_${index}`,
        type: "application" as const,
        title: app.job.title,
        description: `Stage: ${PIPELINE_STAGE_LABELS[app.stage]}`,
        occurredAt: app.updatedAt,
      })),
    ].slice(0, 6),
    upcomingInterviews,
    insight,
    applicationsTimeline: buildApplicationsTimeline(applications),
    jobSync: {
      lastSyncAt: new Date().toISOString(),
      totalCatalogJobs: jobs.length,
      jobsByProvider: [
        { provider: "gupy", count: Math.floor(jobs.length * 0.6) },
        { provider: "seed", count: Math.ceil(jobs.length * 0.4) },
      ],
      providerErrors24h: 0,
      expiredJobsCount: 0,
      closedJobsCount: 0,
      newJobsSinceLastSync: 0,
      newCompaniesCount: 0,
      recentExecutions: [],
    },
    generatedAt: new Date().toISOString(),
  };
};
