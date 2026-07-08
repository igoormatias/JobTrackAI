import type { Company } from "./company";
import type { MatchScore } from "./match";
import type { ProfessionalArea, Seniority, WorkModality } from "./profile";
import type { Technology } from "./technology";

export type JobPriority = "HIGH" | "MEDIUM" | "LOW";

export type JobVisibility = "VISIBLE" | "HIDDEN";

export type JobSource =
  | "gupy"
  | "linkedin"
  | "programathor"
  | "manual"
  | "referral"
  | "recruiter"
  | "company_site"
  | "other";

export type JobStatus = "active" | "closed" | "expired";

export type JobEngagementState = "new" | "viewed" | "favorited" | "applied" | "rejected";

export type EmploymentType = "clt" | "pj" | "contract" | "internship";

export const DEFAULT_JOB_PRIORITY: JobPriority = "MEDIUM";

export const DEFAULT_JOB_VISIBILITY: JobVisibility = "VISIBLE";

export type JobAlternateSource = {
  source: JobSource;
  sourceUrl: string;
  isPrimary: boolean;
};

export type Job = {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  company: Pick<Company, "id" | "name" | "slug" | "logoUrl">;
  area: ProfessionalArea;
  seniority: Seniority;
  modality: WorkModality;
  employmentType?: EmploymentType;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: "BRL";
  description: string;
  descriptionHtml?: string | null;
  requirements: string[];
  benefits: string[];
  responsibilities?: string[];
  technologies: Technology[];
  source: JobSource;
  sourceUrl: string;
  alternateSources?: JobAlternateSource[];
  status: JobStatus;
  isFavorite: boolean;
  trackingId?: string;
  isTracked?: boolean;
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
