import type { JobSource } from "../../../../shared/domain/job-source.js";
import type { MatchProfileInput } from "../../../match/domain/services/match-engine.service.js";

export type CatalogListFilters = {
  userId: string;
  profile?: MatchProfileInput | null;
  cursor?: string;
  limit?: number;
  sortBy?: "recent" | "match" | "date" | "salary" | "title" | "company" | "priority";
  sortDirection?: "asc" | "desc";
  q?: string;
  search?: string;
  areas?: string[];
  companyIds?: string[];
  seniorities?: string[];
  modalities?: string[];
  location?: string;
  locationScope?: "country" | "state" | "city";
  locationState?: string;
  locationCity?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  matchMin?: number;
  dateFrom?: string;
  dateTo?: string;
  isFavorite?: boolean;
  visibility?: "visible" | "hidden" | "all";
  priority?: "high" | "medium" | "low";
  sources?: JobSource[];
  suggested?: boolean;
  strictProfileMatch?: boolean;
};

export type CatalogListResultMeta = {
  limit: number;
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
  jobsWithSalary: number;
  salaryCoverageRatio: number;
  queryMs?: number;
};

export type CatalogListResult<TJob> = {
  data: TJob[];
  meta: CatalogListResultMeta;
};

export type CatalogJobUpsertInput = {
  id?: string;
  userId?: string | null;
  companyName: string;
  companySlug?: string | null;
  title: string;
  slug: string;
  description?: string | null;
  sourceUrl?: string | null;
  source: string;
  externalId?: string | null;
  contentHash?: string | null;
  area?: string | null;
  seniority?: string | null;
  modality?: string | null;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  status?: string;
  isCatalog?: boolean;
  publishedAt?: Date;
  expiresAt?: Date | null;
  lastCheckedAt?: Date | null;
  removedAt?: Date | null;
  metadata?: Record<string, unknown>;
};

export type UserJobContextQuery = {
  userId: string;
  profile?: MatchProfileInput | null;
};
