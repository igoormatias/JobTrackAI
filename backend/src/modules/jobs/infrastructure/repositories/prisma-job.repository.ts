import type { Job as PrismaJob, JobTracking } from "@prisma/client";

import { prisma } from "../../../../database/prisma.js";
import type { JobSource } from "../../../../shared/domain/job-source.js";
import {
  matchEngineService,
  type MatchProfileInput,
} from "../../../match/domain/services/match-engine.service.js";
import type { Job } from "../../types/job.types.js";
import {
  buildUserJobContext,
  mapPrismaJobToDomain,
  toMatchJobInput,
  toMatchScore,
} from "../mappers/job.mapper.js";

export type JobListQuery = {
  userId: string;
  profile?: MatchProfileInput | null;
};

export class PrismaJobRepository {
  async findAllForUser(query: JobListQuery): Promise<Job[]> {
    const [jobs, trackings, views] = await Promise.all([
      prisma.job.findMany({
        where: {
          OR: [{ isCatalog: true }, { userId: query.userId }],
          status: "active",
        },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.jobTracking.findMany({ where: { userId: query.userId } }),
      prisma.jobView.findMany({ where: { userId: query.userId } }),
    ]);

    const ctx = buildUserJobContext(trackings, views);
    return jobs.map((job) => this.mapWithContext(job, ctx, query.profile));
  }

  async findByIdForUser(id: string, query: JobListQuery): Promise<Job | null> {
    const job = await prisma.job.findFirst({
      where: {
        id,
        OR: [{ isCatalog: true }, { userId: query.userId }],
      },
    });
    if (!job) return null;

    const [tracking, view] = await Promise.all([
      prisma.jobTracking.findUnique({ where: { userId_jobId: { userId: query.userId, jobId: id } } }),
      prisma.jobView.findUnique({ where: { userId_jobId: { userId: query.userId, jobId: id } } }),
    ]);

    const ctx = buildUserJobContext(tracking ? [tracking] : [], view ? [view] : []);
    return this.mapWithContext(job, ctx, query.profile);
  }

  async markViewed(userId: string, jobId: string): Promise<Job | null> {
    const job = await this.findByIdForUser(jobId, { userId });
    if (!job) return null;

    await prisma.jobView.upsert({
      where: { userId_jobId: { userId, jobId } },
      create: { userId, jobId },
      update: { viewedAt: new Date() },
    });

    return { ...job, engagementState: job.isFavorite ? "favorited" : "viewed" };
  }

  async upsertFavorite(userId: string, jobId: string, isFavorite: boolean): Promise<JobTracking> {
    const existing = await prisma.jobTracking.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });

    if (existing) {
      return prisma.jobTracking.update({
        where: { id: existing.id },
        data: { isFavorite, updatedAt: new Date() },
      });
    }

    return prisma.jobTracking.create({
      data: {
        userId,
        jobId,
        stage: "discovery",
        isFavorite,
        lastStageUpdatedAt: new Date(),
        timelineEvents: {
          create: {
            type: isFavorite ? "favorited" : "created",
            title: isFavorite ? "Marcada como favorita" : "Processo iniciado",
            occurredAt: new Date(),
            createdById: userId,
          },
        },
      },
    });
  }

  async createManualJob(
    userId: string,
    input: {
      companyName: string;
      title: string;
      sourceUrl?: string | null;
      description?: string | null;
      source: JobSource;
      area?: string;
      modality?: string;
      location?: string;
      externalId?: string;
      contentHash?: string;
      technologies?: Array<{ name: string }>;
    },
  ): Promise<PrismaJob> {
    const slug = input.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-");

    return prisma.job.create({
      data: {
        userId,
        companyName: input.companyName,
        companySlug: input.companyName.toLowerCase().replace(/\s+/g, "-"),
        title: input.title,
        slug,
        description: input.description,
        sourceUrl: input.sourceUrl,
        source: input.source,
        externalId: input.externalId,
        contentHash: input.contentHash,
        area: input.area ?? "frontend",
        modality: input.modality ?? "remote",
        location: input.location ?? "",
        isCatalog: false,
        metadata: {
          technologies: input.technologies ?? [],
          requirements: [],
          benefits: [],
          company: {
            id: `company_${slug}`,
            name: input.companyName,
            slug: input.companyName.toLowerCase().replace(/\s+/g, "-"),
            logoUrl: null,
          },
        },
      },
    });
  }

  async countCatalog(): Promise<number> {
    return prisma.job.count({ where: { isCatalog: true } });
  }

  async updateSourceUrl(jobId: string, sourceUrl: string): Promise<void> {
    await prisma.job.update({
      where: { id: jobId },
      data: { sourceUrl },
    });
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

export const prismaJobRepository = new PrismaJobRepository();
