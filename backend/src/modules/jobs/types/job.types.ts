import type { JobPriority } from "../../../shared/domain/job-priority.js";
import type { JobSource } from "../../../shared/domain/job-source.js";
import type { JobVisibility } from "../../../shared/domain/job-visibility.js";

export type JobEngagementState = "new" | "viewed" | "favorited" | "applied" | "rejected";

export type { JobPriority, JobSource, JobVisibility };

export type JobStatus = "active" | "closed" | "expired";

export type MatchReason = {
  id: string;
  label: string;
  matched: boolean;
};

export type MissingSkill = {
  id: string;
  name: string;
};

export type MatchScore = {
  score: number;
  label: "excellent" | "good" | "fair" | "low";
  reasons: MatchReason[];
  missingSkills: MissingSkill[];
};

export type JobTechnology = {
  id: string;
  name: string;
  slug: string;
};

export type JobCompany = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type Job = {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  company: JobCompany;
  area: string;
  seniority: string;
  modality: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: "BRL";
  description: string;
  requirements: string[];
  benefits: string[];
  technologies: JobTechnology[];
  source: JobSource;
  sourceUrl: string;
  status: JobStatus;
  isFavorite: boolean;
  trackingId?: string;
  priority?: JobPriority;
  visibility?: JobVisibility;
  hiddenAt?: string | null;
  engagementState: JobEngagementState;
  matchScore: MatchScore;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type JobListParams = {
  cursor?: string;
  limit?: number;
  sortBy?: "match" | "date" | "salary" | "title" | "company" | "priority";
  sortDirection?: "asc" | "desc";
  q?: string;
  search?: string;
  areas?: string[];
  companyIds?: string[];
  seniorities?: string[];
  modalities?: string[];
  location?: string;
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
};

export type CursorPaginationMeta = {
  limit: number;
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
};

export type JobListResult = {
  data: Job[];
  meta: CursorPaginationMeta;
};
