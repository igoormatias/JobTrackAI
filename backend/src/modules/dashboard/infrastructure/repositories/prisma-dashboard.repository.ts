import type { Job, Profile } from "@prisma/client";

import { prisma } from "../../../../database/prisma.js";
import {
  DASHBOARD_TOP_MATCH_THRESHOLD,
  isAreaCompatible,
  matchEngineService,
  type MatchJobInput,
  type MatchProfileInput,
} from "../../../match/domain/services/match-engine.service.js";
import { PIPELINE_STAGE_LABELS } from "../../../../shared/domain/pipeline-stage.js";
import { parseJobMetadata } from "../../../../shared/utils/job-metadata.js";
import type { DashboardRepository } from "../../domain/repositories/dashboard.repository.js";
import type {
  DashboardActivityDto,
  DashboardActivityTypeDto,
  DashboardChartPointDto,
  DashboardCompanyInsightDto,
  DashboardDataDto,
  DashboardInsightDto,
  DashboardKpiDto,
  DashboardTopJobDto,
} from "../../application/dto/dashboard-response.dto.js";
import { skillMatcher } from "../../../match/domain/services/skill-matcher.service.js";

const AREA_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  full_stack: "Full Stack",
  mobile: "Mobile",
  devops: "DevOps",
  data_engineer: "Data Engineer",
};

const countBy = <T>(items: T[], getKey: (item: T) => string): Record<string, number> =>
  items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

const topEntries = (record: Record<string, number>, limit = 5): DashboardChartPointDto[] =>
  Object.entries(record)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));

const toMatchProfileInput = (profile: Profile | null): MatchProfileInput => ({
  area: profile?.area,
  seniority: profile?.seniority,
  modality: profile?.modality,
  location: profile?.location,
  locationPreference: profile?.locationPreference as MatchProfileInput["locationPreference"],
  salaryExpectation: profile?.salaryExpectation as MatchProfileInput["salaryExpectation"],
  skillNames: profile?.skillNames ?? [],
});

const toMatchJobInput = (job: Job): MatchJobInput => {
  const metadata = parseJobMetadata(job.metadata);
  const technologies = (metadata.technologies ?? []).filter(
    (tech): tech is { name: string; slug: string } =>
      typeof tech === "object" &&
      tech !== null &&
      typeof tech.name === "string" &&
      tech.name.trim().length > 0,
  ).map((tech) => ({
    name: tech.name,
    slug: typeof tech.slug === "string" && tech.slug.trim().length > 0 ? tech.slug : tech.name,
  }));
  const requirements = (metadata.requirements ?? []).filter(
    (requirement): requirement is string =>
      typeof requirement === "string" && requirement.trim().length > 0,
  );

  return {
    title: job.title,
    area: job.area,
    seniority: job.seniority,
    modality: job.modality,
    location: job.location,
    companyName: job.companyName,
    companySlug: job.companySlug,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    technologies,
    requirements,
  };
};

const mapTimelineTypeToActivity = (type: string): DashboardActivityTypeDto => {
  switch (type) {
    case "favorited":
      return "favorite";
    case "stage_changed":
      return "status_change";
    case "interview_scheduled":
      return "interview";
    case "created":
      return "application";
    default:
      return "status_change";
  }
};

const buildApplicationsTimeline = (
  trackings: Array<{ createdAt: Date; stage: string }>,
): DashboardChartPointDto[] => {
  const weeks = 8;
  const now = Date.now();
  const points: DashboardChartPointDto[] = [];

  for (let index = weeks - 1; index >= 0; index -= 1) {
    const weekEnd = now - index * 7 * 86_400_000;
    const weekStart = weekEnd - 7 * 86_400_000;

    const value = trackings.filter((tracking) => {
      if (tracking.stage === "discovery") return false;
      const createdAt = tracking.createdAt.getTime();
      return createdAt >= weekStart && createdAt < weekEnd;
    }).length;

    points.push({
      label: index === 0 ? "Esta sem." : `S-${weeks - index}`,
      value,
    });
  }

  return points;
};

const buildInsight = (
  profile: Profile | null,
  matchedJobs: Array<{ score: number; area: string | null }>,
  trendPercent: number,
): DashboardInsightDto => {
  const areaLabel = profile?.area ? (AREA_LABELS[profile.area] ?? profile.area) : "compatíveis";
  const primarySkill = profile?.skillNames[0] ?? "suas competências";

  return {
    title: "Insight da semana",
    message: `Você tem ${matchedJobs.length} vagas com bom match em ${areaLabel}. Foque em ${primarySkill} para ampliar oportunidades${trendPercent !== 0 ? ` — tendência de ${trendPercent > 0 ? "+" : ""}${trendPercent}% nos processos ativos` : ""}.`,
    highlight: primarySkill,
    trendPercent,
  };
};

const buildCompanyInsights = (
  trackings: Array<{
    stage: string;
    isFavorite: boolean;
    updatedAt: Date;
    rulesMatchScore: number | null;
    job: Job;
  }>,
): DashboardCompanyInsightDto[] => {
  const byCompany = new Map<string, DashboardCompanyInsightDto & { lastDate: Date }>();

  for (const tracking of trackings) {
    const label = tracking.job.companyName;
    const key = tracking.job.companySlug || label.toLowerCase();
    const existing = byCompany.get(key);
    const inProgress = !["discovery", "closed"].includes(tracking.stage);
    const matchScore = tracking.rulesMatchScore ?? 0;
    const lastDate = tracking.updatedAt;

    if (!existing) {
      byCompany.set(key, {
        label,
        totalJobs: 1,
        inProgress: inProgress ? 1 : 0,
        favorites: tracking.isFavorite ? 1 : 0,
        lastInteractionAt: lastDate.toISOString(),
        bestMatchScore: matchScore,
        lastDate,
      });
      continue;
    }

    existing.totalJobs += 1;
    if (inProgress) existing.inProgress += 1;
    if (tracking.isFavorite) existing.favorites += 1;
    if (matchScore > existing.bestMatchScore) existing.bestMatchScore = matchScore;
    if (lastDate > existing.lastDate) {
      existing.lastDate = lastDate;
      existing.lastInteractionAt = lastDate.toISOString();
    }
  }

  return [...byCompany.values()]
    .sort((a, b) => b.inProgress - a.inProgress || b.totalJobs - a.totalJobs)
    .slice(0, 5)
    .map(({ lastDate: _lastDate, ...item }) => item);
};

const buildTechnologyCounts = (
  trackings: Array<{ job: Job }>,
  _profile: Profile | null,
): Record<string, number> => {
  const counts: Record<string, number> = {};

  for (const { job } of trackings) {
    const metadata = parseJobMetadata(job.metadata);
    const skillNames = new Set<string>();

    for (const tech of metadata.technologies ?? []) {
      if (tech.name?.trim()) skillNames.add(tech.name.trim());
    }
    for (const req of metadata.requirements ?? []) {
      if (req?.trim()) skillNames.add(req.trim());
    }

    for (const raw of skillNames) {
      const canonical = skillMatcher.canonicalize(raw) ?? raw;
      counts[canonical] = (counts[canonical] ?? 0) + 1;
    }
  }

  return counts;
};

const deriveProviderStatus = (
  enabled: boolean,
  latestExecutionStatus: string | undefined,
): string => {
  if (!enabled) return "disabled";
  if (!latestExecutionStatus) return "unknown";
  if (latestExecutionStatus === "failed") return "unhealthy";
  if (latestExecutionStatus === "running") return "degraded";
  return "healthy";
};

export class PrismaDashboardRepository implements DashboardRepository {
  async getDashboardData(userId: string): Promise<DashboardDataDto> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86_400_000);

    const lastSyncExecution = await prisma.providerExecution.findFirst({
      where: { finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
      select: { finishedAt: true },
    });

    const lastSyncAt = lastSyncExecution?.finishedAt ?? null;

    const [
      favoritesCount,
      highPriorityCount,
      hiddenCount,
      inProcessCount,
      favoritesHighMatch,
      highPriorityRecent,
      hiddenRecent,
      interviewsNextWeek,
      interviewsFutureTotal,
      stageGroups,
      timelineEvents,
      userTrackingsWithJobs,
      trackings,
      catalogJobs,
      profile,
      totalCatalogJobs,
      jobsByProviderGroups,
      providerErrors24h,
      recentExecutions,
      expiredJobsCount,
      closedJobsCount,
      newJobsSinceLastSync,
      newCompaniesCount,
      providerRegistry,
      trackingsThisWeek,
      trackingsLastWeek,
      calendarIntegration,
    ] = await Promise.all([
      prisma.jobTracking.count({ where: { userId, isFavorite: true } }),
      prisma.jobTracking.count({ where: { userId, priority: "HIGH" } }),
      prisma.jobTracking.count({ where: { userId, visibility: "HIDDEN" } }),
      prisma.jobTracking.count({
        where: { userId, stage: { notIn: ["discovery", "closed"] } },
      }),
      prisma.jobTracking.count({
        where: { userId, isFavorite: true, priority: "HIGH" },
      }),
      prisma.jobTracking.count({
        where: { userId, priority: "HIGH", updatedAt: { gte: weekAgo } },
      }),
      prisma.jobTracking.count({
        where: { userId, visibility: "HIDDEN", hiddenAt: { gte: weekAgo } },
      }),
      prisma.interview.count({
        where: {
          tracking: { userId },
          scheduledAt: { gte: now, lte: new Date(now.getTime() + 7 * 86_400_000) },
        },
      }),
      prisma.interview.count({
        where: {
          tracking: { userId },
          scheduledAt: { gte: now },
        },
      }),
      prisma.jobTracking.groupBy({
        by: ["stage"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.timelineEvent.findMany({
        where: { tracking: { userId } },
        include: { tracking: { include: { job: true } } },
        orderBy: { occurredAt: "desc" },
        take: 8,
      }),
      prisma.jobTracking.findMany({
        where: { userId },
        include: { job: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.jobTracking.findMany({
        where: { userId },
        select: { createdAt: true, stage: true },
      }),
      prisma.job.findMany({
        // Discovery recommendations — larger pool; area filtered in memory via match engine
        where: { isCatalog: true, status: "active" },
        orderBy: { publishedAt: "desc" },
        take: 500,
      }),
      prisma.profile.findUnique({ where: { userId } }),
      prisma.job.count({ where: { isCatalog: true } }),
      prisma.job.groupBy({
        by: ["source"],
        where: { isCatalog: true },
        _count: { _all: true },
      }),
      prisma.providerExecution.count({
        where: {
          status: "failed",
          startedAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.providerExecution.findMany({
        orderBy: { startedAt: "desc" },
        take: 5,
        select: {
          id: true,
          providerName: true,
          status: true,
          startedAt: true,
          finishedAt: true,
          importedCount: true,
          duplicateCount: true,
          failedCount: true,
          errorMessage: true,
        },
      }),
      prisma.job.count({
        where: {
          isCatalog: true,
          status: "active",
          expiresAt: { lt: now },
        },
      }),
      prisma.job.count({
        where: { isCatalog: true, status: "closed" },
      }),
      lastSyncAt
        ? prisma.job.count({
            where: {
              isCatalog: true,
              createdAt: { gte: lastSyncAt },
            },
          })
        : Promise.resolve(0),
      lastSyncAt
        ? prisma.job
            .findMany({
              where: {
                isCatalog: true,
                createdAt: { gte: lastSyncAt },
              },
              select: { companySlug: true, companyName: true },
              distinct: ["companySlug"],
            })
            .then((rows) => rows.length)
        : Promise.resolve(0),
      prisma.jobProviderRegistry.findMany({ orderBy: { name: "asc" } }),
      prisma.jobTracking.count({
        where: { userId, updatedAt: { gte: weekAgo } },
      }),
      prisma.jobTracking.count({
        where: { userId, updatedAt: { gte: twoWeeksAgo, lt: weekAgo } },
      }),
      prisma.calendarIntegration.findUnique({
        where: { userId },
        select: { id: true, revokedAt: true },
      }),
    ]);

    const matchProfile = toMatchProfileInput(profile);
    const favoriteCompanySlugs = [
      ...new Set(
        userTrackingsWithJobs
          .filter((t) => t.isFavorite)
          .map((t) => (t.job.companySlug ?? t.job.companyName).toLowerCase()),
      ),
    ];
    const pipelineCompanySlugs = [
      ...new Set(
        userTrackingsWithJobs
          .filter((t) => !["discovery", "closed"].includes(t.stage))
          .map((t) => (t.job.companySlug ?? t.job.companyName).toLowerCase()),
      ),
    ];

    const eligibleJobs = catalogJobs.filter((job) =>
      isAreaCompatible(matchProfile, toMatchJobInput(job)),
    );
    const jobsWithMatch = eligibleJobs
      .map((job) => ({
        job,
        match: matchEngineService.compute(matchProfile, toMatchJobInput(job), {
          favoriteCompanySlugs,
          pipelineCompanySlugs,
          savedJobCompanySlugs: favoriteCompanySlugs,
          jobId: job.id,
        }),
      }))
      .filter(({ match }) => match.score >= DASHBOARD_TOP_MATCH_THRESHOLD)
      .sort((a, b) => b.match.score - a.match.score);

    const topMatchedJobs = jobsWithMatch.slice(0, 10);
    const techCounts = buildTechnologyCounts(userTrackingsWithJobs, profile);
    const topCompanies = buildCompanyInsights(userTrackingsWithJobs);
    const areaCounts = countBy(catalogJobs, (job) => job.area ?? "other");

    const trendPercent =
      trackingsLastWeek > 0
        ? Math.round(((trackingsThisWeek - trackingsLastWeek) / trackingsLastWeek) * 100)
        : 0;

    const latestExecutionByProvider = new Map(
      recentExecutions.map((execution) => [execution.providerName, execution.status]),
    );

    const providerHealth = providerRegistry.map((provider) => ({
      provider: provider.name,
      displayName: provider.displayName,
      enabled: provider.enabled,
      status: deriveProviderStatus(provider.enabled, latestExecutionByProvider.get(provider.name)),
      lastRunAt: provider.lastRunAt?.toISOString() ?? null,
      lastHealthAt: provider.lastHealthAt?.toISOString() ?? null,
    }));

    const hasCalendarIntegration = Boolean(calendarIntegration && !calendarIntegration.revokedAt);

    const kpis: DashboardKpiDto[] = [
      {
        id: "kpi_favorites",
        label: "Favoritas",
        value: favoritesCount,
        change: favoritesHighMatch,
        changeLabel: "com alta prioridade",
      },
      {
        id: "kpi_high_priority",
        label: "Alta prioridade",
        value: highPriorityCount,
        change: highPriorityRecent,
        changeLabel: "atualizadas esta semana",
      },
      {
        id: "kpi_hidden",
        label: "Ocultadas",
        value: hiddenCount,
        change: hiddenRecent,
        changeLabel: "ocultadas esta semana",
      },
      {
        id: "kpi_in_process",
        label: "Em processo",
        value: inProcessCount,
        change: stageGroups
          .filter((group) => !["discovery", "closed"].includes(group.stage))
          .reduce((sum, group) => sum + group._count._all, 0),
        changeLabel: "fora de descoberta",
      },
      {
        id: "kpi_interviews",
        label: "Entrevistas",
        value: interviewsFutureTotal,
        change: interviewsNextWeek,
        changeLabel: "próximos 7 dias",
      },
    ];

    const timelineActivities: DashboardActivityDto[] = timelineEvents.map((event) => ({
      id: event.id,
      type: mapTimelineTypeToActivity(event.type),
      title: event.title,
      description: `${event.tracking.job.title} · ${event.tracking.job.companyName}`,
      occurredAt: event.occurredAt.toISOString(),
    }));

    const recentActivities = timelineActivities
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, 8);

    return {
      kpis,
      jobsByArea: Object.entries(areaCounts)
        .map(([area, value]) => ({
          label: AREA_LABELS[area] ?? area.replace("_", " "),
          value,
        }))
        .filter((item) => item.value > 0),
      applicationsByStage: stageGroups.map((group) => ({
        label:
          PIPELINE_STAGE_LABELS[group.stage as keyof typeof PIPELINE_STAGE_LABELS] ?? group.stage,
        value: group._count._all,
      })),
      topTechnologies: topEntries(techCounts, 10),
      topCompanies,
      topJobs: topMatchedJobs.map(({ job, match }) => ({
        id: job.id,
        title: job.title,
        companyName: job.companyName,
        companySlug: job.companySlug,
        modality: job.modality,
        location: job.location,
        source: job.source,
        sourceUrl: job.sourceUrl,
        matchScore: match.score,
        matchLabel: match.label,
        reasons: match.reasons.filter((reason) => reason.matched).slice(0, 6),
        publishedAt: job.publishedAt.toISOString(),
      })),
      recentActivities,
      upcomingInterviews: [],
      insight: buildInsight(
        profile,
        jobsWithMatch.map(({ job, match }) => ({ score: match.score, area: job.area })),
        trendPercent,
      ),
      applicationsTimeline: buildApplicationsTimeline(trackings),
      jobSync: {
        lastSyncAt: lastSyncAt?.toISOString() ?? null,
        totalCatalogJobs,
        jobsByProvider: jobsByProviderGroups.map((group) => ({
          provider: group.source,
          count: group._count._all,
        })),
        providerErrors24h,
        expiredJobsCount,
        closedJobsCount,
        newJobsSinceLastSync,
        newCompaniesCount,
        providerHealth,
        recentExecutions: recentExecutions.map((execution) => ({
          id: execution.id,
          providerName: execution.providerName,
          status: execution.status,
          startedAt: execution.startedAt.toISOString(),
          finishedAt: execution.finishedAt?.toISOString() ?? null,
          importedCount: execution.importedCount,
          duplicateCount: execution.duplicateCount,
          failedCount: execution.failedCount,
          errorMessage: execution.errorMessage,
        })),
      },
      hasCalendarIntegration,
      generatedAt: now.toISOString(),
    };
  }
}

export const prismaDashboardRepository = new PrismaDashboardRepository();
