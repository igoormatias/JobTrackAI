import type { Job as PrismaJob } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { prisma } from "../../../../database/prisma.js";
import { resolveSourceUrlOnSync } from "../../../../shared/utils/source-url-merge.utils.js";
import type { JobPriority } from "../../../../shared/domain/job-priority.js";
import {  
  matchEngineService,
  type MatchProfileInput,
  type MatchUserContext,
} from "../../../match/domain/services/match-engine.service.js";
import {
  buildUserJobContext,
  mapPrismaJobToDomain,
  toMatchJobInput,
  toMatchScore,
} from "../../../jobs/infrastructure/mappers/job.mapper.js";
import type { Job } from "../../../jobs/types/job.types.js";
import type { JobSource } from "../../../../shared/domain/job-source.js";
import type {
  JobCatalogRepository,
  RelatedJobsQuery,
} from "../../domain/repositories/job-catalog.repository.js";
import type {
  CatalogJobUpsertInput,
  CatalogListFilters,
  CatalogListResult,
  UserJobContextQuery,
} from "../../domain/value-objects/catalog-list-filters.js";
import {
  buildCatalogOrderBy,
  buildCatalogWhere,
  buildCatalogWhereWithoutSalaryFilters,
  buildCursorWhere,
  buildJobWithSalaryFilter,
  encodeCursor,
  normalizeCatalogFilters,
} from "../query-builders/catalog-where.builder.js";
import { buildFiltersAppliedMeta } from "../query-builders/filters-applied.builder.js";

const MATCH_SORT_WINDOW = 300;

const priorityWeight: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const getPriorityWeight = (priority?: string | null): number =>
  priority ? (priorityWeight[priority] ?? 0) : 0;

const priorityMap: Record<NonNullable<CatalogListFilters["priority"]>, JobPriority> = {
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

type TrackingFilterContext = {
  includeJobIds?: string[];
  excludeJobIds?: string[];
};

const emptySalaryMeta = {
  jobsWithSalary: 0,
  salaryCoverageRatio: 0,
};

export class PrismaJobCatalogRepository implements JobCatalogRepository {
  private async resolveSalaryCoverageMeta(
    filters: CatalogListFilters,
    trackingContext: TrackingFilterContext,
  ): Promise<{ jobsWithSalary: number; salaryCoverageRatio: number }> {
    const coverageWhere = buildCatalogWhereWithoutSalaryFilters(filters, trackingContext);
    const coverageTotal = await prisma.job.count({ where: coverageWhere });
    const jobsWithSalary = await prisma.job.count({
      where: { AND: [coverageWhere, buildJobWithSalaryFilter()] },
    });

    return {
      jobsWithSalary,
      salaryCoverageRatio: coverageTotal > 0 ? jobsWithSalary / coverageTotal : 0,
    };
  }

  async list(filters: CatalogListFilters): Promise<CatalogListResult<Job>> {
    const startedAt = Date.now();
    const result = await this.listInternal(filters);
    const data = await this.attachAlternateSources(result.data);
    return {
      data,
      meta: { ...result.meta, queryMs: Date.now() - startedAt },
    };
  }

  private async listInternal(filters: CatalogListFilters): Promise<CatalogListResult<Job>> {
    const normalized = normalizeCatalogFilters(filters);
    const limit = normalized.limit ?? 20;
    const sortBy = normalized.sortBy ?? "recent";
    const sortDirection = normalized.sortDirection ?? "desc";
    const filtersApplied = buildFiltersAppliedMeta(normalized);

    const trackingContext = await this.resolveTrackingFilters(normalized);
    if (trackingContext.includeJobIds && trackingContext.includeJobIds.length === 0) {
      return {
        data: [],
        meta: {
          limit,
          total: 0,
          hasMore: false,
          nextCursor: null,
          filtersApplied,
          ...emptySalaryMeta,
        },
      };
    }

    const baseWhere = buildCatalogWhere(normalized, trackingContext);
    const total = await prisma.job.count({ where: baseWhere });
    const salaryMeta = await this.resolveSalaryCoverageMeta(normalized, trackingContext);

    if (sortBy === "match") {
      return this.listWithMatchSort(
        normalized,
        baseWhere,
        total,
        limit,
        salaryMeta,
        filtersApplied,
      );
    }

    if (sortBy === "priority") {
      return this.listWithPrioritySort(
        normalized,
        baseWhere,
        total,
        limit,
        sortDirection,
        salaryMeta,
        filtersApplied,
      );
    }

    const sqlSortBy =
      sortBy === "recent" || sortBy === "date" ? "date" : sortBy;
    const cursorWhere = normalized.cursor
      ? buildCursorWhere(normalized.cursor, sortDirection)
      : undefined;
    const where: Prisma.JobWhereInput = cursorWhere
      ? { AND: [baseWhere, cursorWhere] }
      : baseWhere;

    const records = await prisma.job.findMany({
      where,
      orderBy: buildCatalogOrderBy(sqlSortBy, sortDirection),
      take: limit + 1,
    });

    const hasMore = records.length > limit;
    const pageRecords = hasMore ? records.slice(0, limit) : records;
    const ctx = await this.loadUserContext(normalized.userId);
    const data = pageRecords.map((record) =>
      this.mapWithContext(record, ctx, normalized.profile),
    );

    const last = pageRecords[pageRecords.length - 1];
    const nextCursor = hasMore && last ? encodeCursor(last.publishedAt, last.id) : null;

    return {
      data,
      meta: { limit, total, hasMore, nextCursor, filtersApplied, ...salaryMeta },
    };
  }

  private async listWithMatchSort(
    filters: CatalogListFilters,
    baseWhere: Prisma.JobWhereInput,
    total: number,
    limit: number,
    salaryMeta: { jobsWithSalary: number; salaryCoverageRatio: number },
    filtersApplied: ReturnType<typeof buildFiltersAppliedMeta>,
  ): Promise<CatalogListResult<Job>> {
    const records = await prisma.job.findMany({
      where: baseWhere,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: Math.min(MATCH_SORT_WINDOW, total),
    });

    const ctx = await this.loadUserContext(filters.userId);
    const jobs = records.map((record) => this.mapWithContext(record, ctx, filters.profile));

    jobs.sort((a, b) => {
      const direction = filters.sortDirection === "asc" ? 1 : -1;
      const matchDiff = (b.matchScore.score - a.matchScore.score) * direction;
      if (matchDiff !== 0) return matchDiff;
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    });

    let startIndex = 0;
    if (filters.cursor) {
      const foundIndex = jobs.findIndex((job) => job.id === filters.cursor);
      startIndex = foundIndex >= 0 ? foundIndex + 1 : 0;
    }

    const data = jobs.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < jobs.length;
    const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

    return {
      data,
      meta: {
        limit,
        total,
        hasMore,
        nextCursor,
        filtersApplied,
        ...salaryMeta,
      },
    };
  }

  private async listWithPrioritySort(
    filters: CatalogListFilters,
    baseWhere: Prisma.JobWhereInput,
    total: number,
    limit: number,
    sortDirection: CatalogListFilters["sortDirection"],
    salaryMeta: { jobsWithSalary: number; salaryCoverageRatio: number },
    filtersApplied: ReturnType<typeof buildFiltersAppliedMeta>,
  ): Promise<CatalogListResult<Job>> {
    const records = await prisma.job.findMany({
      where: baseWhere,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: Math.min(MATCH_SORT_WINDOW, total),
    });

    const ctx = await this.loadUserContext(filters.userId);
    const jobs = records.map((record) => this.mapWithContext(record, ctx, filters.profile));
    const direction = sortDirection === "asc" ? 1 : -1;

    jobs.sort((a, b) => {
      const priorityDiff =
        (getPriorityWeight(a.priority) - getPriorityWeight(b.priority)) * direction;
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    let startIndex = 0;
    if (filters.cursor) {
      const foundIndex = jobs.findIndex((job) => job.id === filters.cursor);
      startIndex = foundIndex >= 0 ? foundIndex + 1 : 0;
    }

    const data = jobs.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < jobs.length;
    const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

    return {
      data,
      meta: {
        limit,
        total,
        hasMore,
        nextCursor,
        filtersApplied,
        ...salaryMeta,
      },
    };
  }

  async count(filters: CatalogListFilters): Promise<number> {
    const normalized = normalizeCatalogFilters(filters);
    const trackingContext = await this.resolveTrackingFilters(normalized);
    if (trackingContext.includeJobIds && trackingContext.includeJobIds.length === 0) return 0;
    return prisma.job.count({ where: buildCatalogWhere(normalized, trackingContext) });
  }

  async findById(id: string, context: UserJobContextQuery): Promise<Job | null> {
    const job = await prisma.job.findFirst({
      where: {
        id,
        OR: [{ isCatalog: true }, { userId: context.userId }],
      },
    });
    if (!job) return null;

    const userCtx = await this.loadUserContextForJob(context.userId, id);
    const mapped = this.mapWithContext(job, userCtx, context.profile);
    const [withAlternates] = await this.attachAlternateSources([mapped]);
    return withAlternates ?? null;
  }

  async findRelated(query: RelatedJobsQuery): Promise<Job[]> {
    const limit = query.limit ?? 5;
    const where = buildCatalogWhere(
      { userId: query.userId, profile: query.profile },
      { excludeJobIds: [query.jobId] },
    );

    const records = await prisma.job.findMany({
      where: {
        AND: [
          where,
          {
            OR: [
              { area: query.area },
              ...query.technologySlugs.map((slug) => ({
                description: { contains: slug, mode: "insensitive" as const },
              })),
            ],
          },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: Math.min(limit * 4, 40),
    });

    const ctx = await this.loadUserContext(query.userId);
    const jobs = records
      .map((record) => this.mapWithContext(record, ctx, query.profile))
      .sort((a, b) => b.matchScore.score - a.matchScore.score)
      .slice(0, limit);

    return jobs;
  }

  async upsertCatalogJob(data: CatalogJobUpsertInput): Promise<Job> {
    if (!data.id && !data.externalId) {
      throw new Error("Catalog upsert requires id or externalId");
    }

    let updateData = data;
    if (data.externalId) {
      const existing = await prisma.job.findUnique({
        where: { source_externalId: { source: data.source, externalId: data.externalId } },
        select: { sourceUrl: true },
      });
      if (existing) {
        const mergedUrl = resolveSourceUrlOnSync(existing.sourceUrl, data.sourceUrl);
        updateData = { ...data, sourceUrl: mergedUrl ?? data.sourceUrl };
      }
    }

    const record = updateData.externalId
      ? await prisma.job.upsert({
          where: { source_externalId: { source: updateData.source, externalId: updateData.externalId } },
          create: this.toCreateInput(updateData) as Prisma.JobCreateInput,
          update: this.toUpdateInput(updateData),
        })
      : await prisma.job.upsert({
          where: { id: updateData.id! },
          create: this.toCreateInput(updateData) as Prisma.JobCreateInput,
          update: this.toUpdateInput(updateData),
        });

    const ctx = await this.loadUserContextForJob(data.userId ?? "", record.id);
    return this.mapWithContext(record, ctx, null);
  }

  async upsertManyCatalogJobs(data: CatalogJobUpsertInput[]): Promise<{ imported: number; updated: number }> {
    if (data.length === 0) return { imported: 0, updated: 0 };

    let imported = 0;
    let updated = 0;

    await prisma.$transaction(async (tx) => {
      for (const item of data) {
        if (!item.externalId) continue;

        const existing = await tx.job.findUnique({
          where: { source_externalId: { source: item.source, externalId: item.externalId } },
          select: { id: true, sourceUrl: true },
        });

        const mergedUrl =
          existing != null
            ? resolveSourceUrlOnSync(existing.sourceUrl, item.sourceUrl) ?? item.sourceUrl ?? null
            : item.sourceUrl ?? null;

        const mergedItem = {
          ...item,
          sourceUrl: mergedUrl,
        };

        if (!mergedItem.externalId) continue;

        await tx.job.upsert({
          where: { source_externalId: { source: mergedItem.source, externalId: mergedItem.externalId } },
          create: this.toCreateInput(mergedItem) as Prisma.JobCreateInput,
          update: this.toUpdateInput(mergedItem),
        });

        if (existing) updated += 1;
        else imported += 1;
      }
    });

    return { imported, updated };
  }

  async touchLastCheckedAt(source: string, externalIds: string[]): Promise<void> {
    if (externalIds.length === 0) return;

    await prisma.job.updateMany({
      where: {
        source,
        externalId: { in: externalIds },
        isCatalog: true,
      },
      data: { lastCheckedAt: new Date() },
    });
  }

  async markStaleByProvider(
    source: string,
    activeExternalIds: string[],
  ): Promise<{ count: number; closedJobIds: string[] }> {
    const stale = await prisma.job.findMany({
      where: {
        source,
        isCatalog: true,
        status: "active",
        externalId: { not: null, notIn: activeExternalIds },
      },
      select: { id: true },
    });

    if (stale.length === 0) return { count: 0, closedJobIds: [] };

    const closedJobIds = stale.map((job) => job.id);

    await prisma.job.updateMany({
      where: { id: { in: closedJobIds } },
      data: {
        status: "closed",
        removedAt: new Date(),
      },
    });

    return { count: closedJobIds.length, closedJobIds };
  }

  private toCreateInput(data: CatalogJobUpsertInput): Prisma.JobCreateManyInput {
    return {
      id: data.id,
      userId: data.userId ?? null,
      companyName: data.companyName,
      companySlug: data.companySlug,
      title: data.title,
      slug: data.slug,
      description: data.description,
      sourceUrl: data.sourceUrl,
      source: data.source,
      externalId: data.externalId,
      contentHash: data.contentHash,
      area: data.area,
      seniority: data.seniority,
      modality: data.modality,
      location: data.location,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      currency: data.currency ?? "BRL",
      status: data.status ?? "active",
      isCatalog: data.isCatalog ?? true,
      publishedAt: data.publishedAt ?? new Date(),
      expiresAt: data.expiresAt ?? null,
      lastCheckedAt: data.lastCheckedAt ?? new Date(),
      metadata: data.metadata as Prisma.InputJsonValue,
      searchText: data.searchText ?? null,
      technologyText: data.technologyText ?? null,
      technologySlugs: data.technologySlugs ?? [],
      requirementsText: data.requirementsText ?? null,
      benefitsText: data.benefitsText ?? null,
      descriptionHtml: data.descriptionHtml ?? null,
    };
  }

  private toUpdateInput(data: CatalogJobUpsertInput): Prisma.JobUpdateInput {
    return {
      companyName: data.companyName,
      companySlug: data.companySlug,
      title: data.title,
      slug: data.slug,
      description: data.description,
      sourceUrl: data.sourceUrl,
      contentHash: data.contentHash,
      area: data.area,
      seniority: data.seniority,
      modality: data.modality,
      location: data.location,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      status: data.status ?? "active",
      publishedAt: data.publishedAt,
      expiresAt: data.expiresAt,
      lastCheckedAt: data.lastCheckedAt ?? new Date(),
      removedAt: data.removedAt,
      metadata: data.metadata as Prisma.InputJsonValue,
      searchText: data.searchText ?? null,
      technologyText: data.technologyText ?? null,
      technologySlugs: data.technologySlugs ?? [],
      requirementsText: data.requirementsText ?? null,
      benefitsText: data.benefitsText ?? null,
      descriptionHtml: data.descriptionHtml ?? null,
    };
  }


  private async attachAlternateSources(jobs: Job[]): Promise<Job[]> {
    if (jobs.length === 0) return jobs;

    const alternates = await prisma.jobAlternateSource.findMany({
      where: { jobId: { in: jobs.map((job) => job.id) } },
    });

    const byJobId = new Map<string, typeof alternates>();
    for (const alternate of alternates) {
      const existing = byJobId.get(alternate.jobId) ?? [];
      existing.push(alternate);
      byJobId.set(alternate.jobId, existing);
    }

    return jobs.map((job) => {
      const jobAlternates = byJobId.get(job.id) ?? [];
      const sources = [
        { source: job.source, sourceUrl: job.sourceUrl, isPrimary: true },
        ...jobAlternates
          .filter((alternate) => Boolean(alternate.sourceUrl))
          .map((alternate) => ({
            source: alternate.source as JobSource,
            sourceUrl: alternate.sourceUrl!,
            isPrimary: alternate.isPrimary,
          })),
      ];

      const uniqueSources = sources.filter(
        (source, index, list) =>
          list.findIndex(
            (item) => item.source === source.source && item.sourceUrl === source.sourceUrl,
          ) === index,
      );

      return {
        ...job,
        alternateSources: uniqueSources.length > 1 ? uniqueSources : undefined,
      };
    });
  }

  private async resolveTrackingFilters(filters: CatalogListFilters): Promise<TrackingFilterContext> {
    const context: TrackingFilterContext = {};

    if (filters.visibility === "hidden") {
      const hidden = await prisma.jobTracking.findMany({
        where: { userId: filters.userId, visibility: "HIDDEN" },
        select: { jobId: true },
      });
      context.includeJobIds = hidden.map((item) => item.jobId);
    } else if (filters.visibility !== "all") {
      const hidden = await prisma.jobTracking.findMany({
        where: { userId: filters.userId, visibility: "HIDDEN" },
        select: { jobId: true },
      });
      context.excludeJobIds = hidden.map((item) => item.jobId);
    }

    if (filters.isFavorite !== undefined) {
      const favorites = await prisma.jobTracking.findMany({
        where: { userId: filters.userId, isFavorite: filters.isFavorite },
        select: { jobId: true },
      });
      const favoriteIds = favorites.map((item) => item.jobId);
      context.includeJobIds = context.includeJobIds
        ? context.includeJobIds.filter((id) => favoriteIds.includes(id))
        : favoriteIds;
    }

    if (filters.priority) {
      const prioritized = await prisma.jobTracking.findMany({
        where: { userId: filters.userId, priority: priorityMap[filters.priority] },
        select: { jobId: true },
      });
      const priorityIds = prioritized.map((item) => item.jobId);
      context.includeJobIds = context.includeJobIds
        ? context.includeJobIds.filter((id) => priorityIds.includes(id))
        : priorityIds;
    }

    return context;
  }

  private async loadUserContext(userId: string) {
    const [trackings, views] = await Promise.all([
      prisma.jobTracking.findMany({ where: { userId }, include: { job: true } }),
      prisma.jobView.findMany({ where: { userId } }),
    ]);
    const base = buildUserJobContext(
      trackings.map(({ job: _job, ...tracking }) => tracking),
      views,
    );
    const favoriteCompanySlugs = [
      ...new Set(
        trackings
          .filter((t) => t.isFavorite)
          .map((t) => (t.job.companySlug ?? t.job.companyName).toLowerCase()),
      ),
    ];
    const pipelineCompanySlugs = [
      ...new Set(
        trackings
          .filter((t) => !["discovery", "closed"].includes(t.stage))
          .map((t) => (t.job.companySlug ?? t.job.companyName).toLowerCase()),
      ),
    ];
    const savedJobCompanySlugs = favoriteCompanySlugs;
    const matchContext: MatchUserContext = {
      favoriteCompanySlugs,
      pipelineCompanySlugs,
      savedJobCompanySlugs,
      viewedJobIds: base.viewedJobIds,
    };
    return { ...base, matchContext };
  }

  private async loadUserContextForJob(userId: string, jobId: string) {
    const [trackingWithJob, view, ctx] = await Promise.all([
      prisma.jobTracking.findUnique({
        where: { userId_jobId: { userId, jobId } },
      }),
      prisma.jobView.findUnique({ where: { userId_jobId: { userId, jobId } } }),
      this.loadUserContext(userId),
    ]);
    return {
      ...buildUserJobContext(trackingWithJob ? [trackingWithJob] : [], view ? [view] : []),
      matchContext: { ...ctx.matchContext, jobId },
    };
  }

  private mapWithContext(
    record: PrismaJob,
    ctx: Awaited<ReturnType<PrismaJobCatalogRepository["loadUserContext"]>>,
    profile?: MatchProfileInput | null,
  ): Job {
    const tracking = ctx.trackingsByJobId.get(record.id);
    const viewed = ctx.viewedJobIds.has(record.id);
    const matchScore = profile
      ? toMatchScore(
          matchEngineService.compute(profile, toMatchJobInput(record), {
            ...ctx.matchContext,
            jobId: record.id,
          }),
        )
      : undefined;
    return mapPrismaJobToDomain(record, { tracking, viewed, matchScore });
  }
}

export const prismaJobCatalogRepository = new PrismaJobCatalogRepository();
