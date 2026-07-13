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

export type MatchFactor = {
  id: string;
  label: string;
  weight: number;
  applicable: boolean;
  ratio: number;
  points: number;
  matched: boolean;
  detail: string;
};

export type SkillEvidence = {
  name: string;
  slug: string;
  present: boolean;
};

export type SkillCoverage = {
  matched: number;
  required: number;
  percent: number;
};

export type MatchScore = {
  score: number;
  label: "excellent" | "good" | "fair" | "low";
  reasons: MatchReason[];
  missingSkills: MissingSkill[];
  matchedSkills?: string[];
  factors?: MatchFactor[];
  skillEvidence?: SkillEvidence[];
  skillCoverage?: SkillCoverage;
  engineVersion?: string;
};

export type JobTechnology = {
  id: string;
  name: string;
  slug: string;
};

export type JobAlternateSource = {
  source: JobSource;
  sourceUrl: string;
  isPrimary: boolean;
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
  descriptionHtml?: string | null;
  requirements: string[];
  benefits: string[];
  responsibilities?: string[];
  technologies: JobTechnology[];
  source: JobSource;
  sourceUrl: string;
  alternateSources?: JobAlternateSource[];
  status: JobStatus;
  isFavorite: boolean;
  trackingId?: string;
  isTracked: boolean;
  stage?: string | null;
  trackingStatus?: string | null;
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

export type CursorPaginationMeta = {
  limit: number;
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
  jobsWithSalary: number;
  salaryCoverageRatio: number;
  filtersApplied?: Record<string, string | number | boolean | string[]>;
  queryMs?: number;
};

export type JobListResult = {
  data: Job[];
  meta: CursorPaginationMeta;
};
