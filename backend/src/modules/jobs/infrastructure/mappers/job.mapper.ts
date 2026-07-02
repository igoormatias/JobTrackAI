import type { Job as PrismaJob, JobTracking, JobView } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import type { Job, JobEngagementState, MatchScore } from "../../types/job.types.js";
import type { MatchResultDto } from "../../../match/domain/services/match-engine.service.js";

type JobMetadata = {
  technologies?: Array<{ id: string; name: string; slug: string }>;
  requirements?: string[];
  benefits?: string[];
  company?: { id: string; name: string; slug: string; logoUrl: string | null; industry?: string };
};

export const parseJobMetadata = (metadata: Prisma.JsonValue | null): JobMetadata => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  return metadata as JobMetadata;
};

export const toMatchScore = (result: MatchResultDto): MatchScore => ({
  score: result.score,
  label: result.label,
  reasons: result.reasons,
  missingSkills: result.missingSkills.map(({ id, name }) => ({ id, name })),
});

export const getEngagementState = (
  tracking: JobTracking | null | undefined,
  viewed: boolean,
): JobEngagementState => {
  if (tracking && tracking.stage !== "discovery") return "applied";
  if (tracking?.isFavorite) return "favorited";
  if (viewed) return "viewed";
  return "new";
};

export const mapPrismaJobToDomain = (
  record: PrismaJob,
  options: {
    tracking?: JobTracking | null;
    viewed?: boolean;
    matchScore?: MatchScore;
  } = {},
): Job => {
  const meta = parseJobMetadata(record.metadata);
  const company = meta.company ?? {
    id: record.companySlug ?? `company_${record.id}`,
    name: record.companyName,
    slug: record.companySlug ?? record.companyName.toLowerCase().replace(/\s+/g, "-"),
    logoUrl: null,
  };

  const tracking = options.tracking;
  const viewed = options.viewed ?? false;
  const defaultMatch: MatchScore = {
    score: 0,
    label: "low",
    reasons: [],
    missingSkills: [],
  };

  return {
    id: record.id,
    title: record.title,
    slug: record.slug ?? record.id,
    companyId: company.id,
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logoUrl: company.logoUrl,
    },
    area: record.area ?? "frontend",
    seniority: record.seniority ?? "mid",
    modality: record.modality ?? "remote",
    location: record.location ?? "",
    salaryMin: record.salaryMin,
    salaryMax: record.salaryMax,
    currency: "BRL",
    description: record.description ?? "",
    requirements: meta.requirements ?? [],
    benefits: meta.benefits ?? [],
    technologies: meta.technologies ?? [],
    source: record.source as Job["source"],
    sourceUrl: record.sourceUrl ?? "",
    status: (record.status as Job["status"]) ?? "active",
    isFavorite: tracking?.isFavorite ?? false,
    priority: (tracking?.priority as Job["priority"]) ?? "MEDIUM",
    visibility: (tracking?.visibility as Job["visibility"]) ?? "VISIBLE",
    hiddenAt: tracking?.hiddenAt?.toISOString() ?? null,
    engagementState: getEngagementState(tracking, viewed),
    matchScore: options.matchScore ?? defaultMatch,
    publishedAt: record.publishedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
};

export const toMatchJobInput = (record: PrismaJob) => {
  const meta = parseJobMetadata(record.metadata);
  return {
    area: record.area,
    seniority: record.seniority,
    modality: record.modality,
    location: record.location,
    salaryMin: record.salaryMin,
    salaryMax: record.salaryMax,
    technologies: meta.technologies ?? [],
    requirements: meta.requirements ?? [],
  };
};

export type UserJobContext = {
  trackingsByJobId: Map<string, JobTracking>;
  viewedJobIds: Set<string>;
};

export const buildUserJobContext = (
  trackings: JobTracking[],
  views: JobView[],
): UserJobContext => ({
  trackingsByJobId: new Map(trackings.map((t) => [t.jobId, t])),
  viewedJobIds: new Set(views.map((v) => v.jobId)),
});
