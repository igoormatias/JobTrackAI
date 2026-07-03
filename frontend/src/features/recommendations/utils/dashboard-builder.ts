import type { Application, DashboardActivity, DashboardChartPoint, DashboardData, DashboardInsight, Job } from "@/types";

import { AREA_OPTIONS } from "@/features/onboarding/constants/areas";
import { PIPELINE_STAGE_LABELS } from "@/features/pipeline/constants/pipeline-columns";

import { sortJobsByMatchAndDate } from "./job-sorter";
import type { RecommendationProfile } from "../types/recommendation.types";

export type BuildDashboardInput = {
  jobs: Job[];
  applications: Application[];
  profile: RecommendationProfile;
};

const countBy = <T>(items: T[], getKey: (item: T) => string): Record<string, number> =>
  items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

const getAreaLabel = (area: RecommendationProfile["area"]): string => {
  if (!area) return "compatíveis";
  return AREA_OPTIONS.find((option) => option.value === area)?.label ?? area.replace("_", " ");
};

const topEntries = (record: Record<string, number>, limit = 5) =>
  Object.entries(record)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));

const isWithinDays = (date: string, days: number): boolean =>
  new Date(date) > new Date(Date.now() - days * 86400000);

export const buildApplicationsTimeline = (applications: Application[]): DashboardChartPoint[] => {
  const weeks = 8;
  const now = Date.now();
  const points: DashboardChartPoint[] = [];

  for (let index = weeks - 1; index >= 0; index -= 1) {
    const weekEnd = now - index * 7 * 86400000;
    const weekStart = weekEnd - 7 * 86400000;

    const value = applications.filter((application) => {
      const appliedAt = new Date(application.appliedAt).getTime();
      return appliedAt >= weekStart && appliedAt < weekEnd;
    }).length;

    points.push({
      label: index === 0 ? "Esta sem." : `S-${weeks - index}`,
      value,
    });
  }

  return points;
};

export const buildDashboardInsight = (
  profile: RecommendationProfile,
  compatibleJobs: Job[],
  newJobsCount: number,
): DashboardInsight => {
  const areaLabel = getAreaLabel(profile.area);
  const primarySkill = profile.skillNames[0] ?? "suas competências";

  const skillJobsThisWeek = compatibleJobs.filter(
    (job) =>
      isWithinDays(job.publishedAt, 7) &&
      job.technologies.some((tech) =>
        tech.name.toLowerCase().includes(primarySkill.toLowerCase()),
      ),
  ).length;

  const trendPercent = Math.min(38, Math.max(8, skillJobsThisWeek * 6 + newJobsCount));

  return {
    title: "Insight da semana",
    message: `Encontramos mais vagas ${areaLabel} esta semana. As oportunidades ${primarySkill} cresceram ${trendPercent}%. Continuaremos monitorando novas vagas.`,
    highlight: primarySkill,
    trendPercent,
  };
};

const buildRecentActivities = (
  sortedJobs: Job[],
  applications: Application[],
  favoriteJobs: Job[],
): DashboardActivity[] => {
  const jobActivities: DashboardActivity[] = sortedJobs.slice(0, 2).map((job, index) => ({
    id: `activity_job_${index}`,
    type: "job",
    title: "Nova vaga encontrada",
    description: `${job.title} · ${job.company.name} · ${job.matchScore.score}% match`,
    occurredAt: job.publishedAt,
  }));

  const favoriteActivities: DashboardActivity[] = favoriteJobs.slice(0, 2).map((job, index) => ({
    id: `activity_fav_${index}`,
    type: "favorite",
    title: "Vaga favoritada",
    description: `${job.title} · ${job.company.name}`,
    occurredAt: job.updatedAt,
  }));

  const applicationActivities: DashboardActivity[] = applications.slice(0, 2).map((app, index) => ({
    id: `activity_app_${index}`,
    type: "application",
    title: "Aplicação realizada",
    description: `${app.job.title} · ${app.job.company.name}`,
    occurredAt: app.appliedAt,
  }));

  const statusActivities: DashboardActivity[] = applications
    .flatMap((app, appIndex) =>
      app.timeline.slice(-1).map((event, eventIndex) => ({
        id: `activity_status_${appIndex}_${eventIndex}`,
        type: "status_change" as const,
        title: "Status alterado",
        description: `${app.job.title} · ${event.title}`,
        occurredAt: event.occurredAt,
      })),
    )
    .slice(0, 2);

  const interviewActivities: DashboardActivity[] = applications
    .filter((app) => app.nextInterviewAt)
    .slice(0, 2)
    .map((app, index) => ({
      id: `activity_interview_${index}`,
      type: "interview",
      title: "Entrevista marcada",
      description: `${app.job.title} · ${app.job.company.name}`,
      occurredAt: app.nextInterviewAt!,
    }));

  return [...jobActivities, ...favoriteActivities, ...applicationActivities, ...statusActivities, ...interviewActivities]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 8);
};

export const buildPersonalizedDashboard = ({
  jobs,
  applications,
  profile,
}: BuildDashboardInput): DashboardData => {
  const sortedJobs = sortJobsByMatchAndDate(jobs);
  const areaLabel = getAreaLabel(profile.area);

  const compatibleJobs = profile.area
    ? sortedJobs.filter((job) => job.area === profile.area && job.matchScore.score >= 60)
    : sortedJobs.filter((job) => job.matchScore.score >= 60);

  const matchAbove90 = sortedJobs.filter((job) => job.matchScore.score >= 90);
  const favoriteJobs = sortedJobs.filter((job) => job.isFavorite);

  const techSource = compatibleJobs.length > 0 ? compatibleJobs : sortedJobs;
  const techCounts = countBy(
    techSource.flatMap((job) => job.technologies),
    (tech) => tech.name,
  );
  const companyCounts = countBy(
    compatibleJobs.length > 0 ? compatibleJobs : sortedJobs,
    (job) => job.company.name,
  );
  const areaCounts = countBy(sortedJobs, (job) => job.area);
  const stageCounts = countBy(applications, (app) => app.stage);

  const upcomingInterviews = applications
    .filter((app) => app.nextInterviewAt)
    .sort((a, b) => new Date(a.nextInterviewAt!).getTime() - new Date(b.nextInterviewAt!).getTime())
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

  const newJobsInArea = compatibleJobs.filter((job) => isWithinDays(job.publishedAt, 7)).length;
  const interviewsNextWeek = upcomingInterviews.filter((interview) =>
    isWithinDays(interview.scheduledAt, 7),
  ).length;

  const insight = buildDashboardInsight(profile, compatibleJobs, newJobsInArea);

  return {
    kpis: [
      {
        id: "kpi_new_jobs",
        label: "Novas vagas",
        value: newJobsInArea,
        change: newJobsInArea,
        changeLabel: `em ${areaLabel} esta semana`,
      },
      {
        id: "kpi_match_90",
        label: "Match acima de 90%",
        value: matchAbove90.length,
        change: matchAbove90.filter((job) => job.area === profile.area).length,
        changeLabel: "na sua área",
      },
      {
        id: "kpi_favorites",
        label: "Favoritas",
        value: favoriteJobs.length,
        change: favoriteJobs.filter((job) => job.matchScore.score >= 85).length,
        changeLabel: "com alto match",
      },
      {
        id: "kpi_applications",
        label: "Aplicações",
        value: applications.length,
        change: applications.filter((app) => app.stage !== "discovery").length,
        changeLabel: "em andamento",
      },
      {
        id: "kpi_interviews",
        label: "Entrevistas",
        value: upcomingInterviews.length,
        change: interviewsNextWeek,
        changeLabel: "próximos 7 dias",
      },
    ],
    jobsByArea: AREA_OPTIONS.map((area) => ({
      label: area.label,
      value: areaCounts[area.value] ?? 0,
    })).filter((item) => item.value > 0),
    applicationsByStage: Object.entries(stageCounts).map(([stage, value]) => ({
      label: PIPELINE_STAGE_LABELS[stage as keyof typeof PIPELINE_STAGE_LABELS] ?? stage,
      value,
    })),
    topTechnologies: topEntries(techCounts),
    topCompanies: topEntries(companyCounts),
    recentActivities: buildRecentActivities(sortedJobs, applications, favoriteJobs),
    upcomingInterviews,
    insight,
    applicationsTimeline: buildApplicationsTimeline(applications),
    jobSync: {
      lastSyncAt: null,
      totalCatalogJobs: sortedJobs.length,
      jobsByProvider: [],
      providerErrors24h: 0,
      recentExecutions: [],
    },
    generatedAt: new Date().toISOString(),
  };
};
