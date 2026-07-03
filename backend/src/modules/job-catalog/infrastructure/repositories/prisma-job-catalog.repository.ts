import type { Job as PrismaJob } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { prisma } from "../../../../database/prisma.js";
import type { JobPriority } from "../../../../shared/domain/job-priority.js";
import {
  matchEngineService,
  type MatchProfileInput,
} from "../../../match/domain/services/match-engine.service.js";
import {
  buildUserJobContext,
  mapPrismaJobToDomain,
  toMatchJobInput,
  toMatchScore,
} from "../../../jobs/infrastructure/mappers/job.mapper.js";
import type { Job } from "../../../jobs/types/job.types.js";
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
  buildCursorWhere,
  encodeCursor,
  normalizeCatalogFilters,
} from "../query-builders/catalog-where.builder.js";

const CATALOG_MATCH_CAP = 500;

const priorityMap: Record<NonNullable<CatalogListFilters["priority"]>, JobPriority> = {
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

type TrackingFilterContext = {
  includeJobIds?: string[];
  excludeJobIds?: string[];
};

export class PrismaJobCatalogRepository implements JobCatalogRepository {
  async list(filters: CatalogListFilters): Promise<CatalogListResult<Job>> {
    const normalized = normalizeCatalogFilters(filters);
    const limit = normalized.limit ?? 20;
    const sortBy = normalized.sortBy ?? "date";
    const sortDirection = normalized.sortDirection ?? "desc";

    const trackingContext = await this.resolveTrackingFilters(normalized);
    if (trackingContext.includeJobIds && trackingContext.includeJobIds.length === 0) {
      return { data: [], meta: { limit, total: 0, hasMore: false, nextCursor: null } };
    }

    const baseWhere = buildCatalogWhere(normalized, trackingContext);
    const total = await prisma.job.count({ where: baseWhere });

    if (sortBy === "match" || normalized.matchMin !== undefined) {
      return this.listWithMatchSort(normalized, baseWhere, total, limit);
    }

    const cursorWhere = normalized.cursor ? buildCursorWhere(normalized.cursor, sortDirection) : undefined;
    const where: Prisma.JobWhereInput = cursorWhere ? { AND: [baseWhere, cursorWhere] } : baseWhere;

    const records = await prisma.job.findMany({
      where,
      orderBy: buildCatalogOrderBy(sortBy, sortDirection),
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
      meta: { limit, total, hasMore, nextCursor },
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
    return this.mapWithContext(job, userCtx, context.profile);
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

    const record = data.externalId
      ? await prisma.job.upsert({
          where: { source_externalId: { source: data.source, externalId: data.externalId } },
          create: this.toCreateInput(data) as Prisma.JobCreateInput,
          update: this.toUpdateInput(data),
        })
      : await prisma.job.upsert({
          where: { id: data.id! },
          create: this.toCreateInput(data) as Prisma.JobCreateInput,
          update: this.toUpdateInput(data),
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
          select: { id: true },
        });

        await tx.job.upsert({
          where: { source_externalId: { source: item.source, externalId: item.externalId } },
          create: this.toCreateInput(item) as Prisma.JobCreateInput,
          update: this.toUpdateInput(item),
        });

        if (existing) updated += 1;
        else imported += 1;
      }
    });

    return { imported, updated };
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
      metadata: data.metadata as Prisma.InputJsonValue,
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
      metadata: data.metadata as Prisma.InputJsonValue,
    };
  }

  private async listWithMatchSort(
    filters: CatalogListFilters,
    baseWhere: Prisma.JobWhereInput,
    total: number,
    limit: number,
  ): Promise<CatalogListResult<Job>> {
    const records = await prisma.job.findMany({
      where: baseWhere,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: CATALOG_MATCH_CAP,
    });

    const ctx = await this.loadUserContext(filters.userId);
    let jobs = records.map((record) => this.mapWithContext(record, ctx, filters.profile));

    if (filters.matchMin !== undefined) {
      jobs = jobs.filter((job) => job.matchScore.score >= filters.matchMin!);
    }

    jobs.sort((a, b) => {
      const direction = filters.sortDirection === "asc" ? 1 : -1;
      return (a.matchScore.score - b.matchScore.score) * direction;
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
        total: filters.matchMin !== undefined ? jobs.length : total,
        hasMore,
        nextCursor,
      },
    };
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
      prisma.jobTracking.findMany({ where: { userId } }),
      prisma.jobView.findMany({ where: { userId } }),
    ]);
    return buildUserJobContext(trackings, views);
  }

  private async loadUserContextForJob(userId: string, jobId: string) {
    const [tracking, view] = await Promise.all([
      prisma.jobTracking.findUnique({ where: { userId_jobId: { userId, jobId } } }),
      prisma.jobView.findUnique({ where: { userId_jobId: { userId, jobId } } }),
    ]);
    return buildUserJobContext(tracking ? [tracking] : [], view ? [view] : []);
  }

  private mapWithContext(
    record: PrismaJob,
    ctx: ReturnType<typeof buildUserJobContext>,
    profile?: MatchProfileInput | null,
  ): Job {
    const tracking = ctx.trackingsByJobId.get(record.id);
    const viewed = ctx.viewedJobIds.has(record.id);
    const matchScore = profile
      ? toMatchScore(matchEngineService.compute(profile, toMatchJobInput(record)))
      : undefined;
    return mapPrismaJobToDomain(record, { tracking, viewed, matchScore });
  }
}

export const prismaJobCatalogRepository = new PrismaJobCatalogRepository();
