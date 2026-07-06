import type { JobSortField, SortDirection } from "./api";
import type { JobSource } from "./job";
import type { NotificationCategory, NotificationType } from "./notification";
import type { PipelineStage } from "./application";
import type { ProfessionalArea, Seniority, WorkModality } from "./profile";

export type JobVisibilityFilter = "visible" | "hidden" | "all";

export type JobPriorityFilter = "high" | "medium" | "low";

export type JobListParams = {
  cursor?: string;
  limit?: number;
  sortBy?: JobSortField;
  sortDirection?: SortDirection;
  q?: string;
  role?: string;
  companyId?: string;
  companyIds?: string[];
  area?: ProfessionalArea;
  areas?: ProfessionalArea[];
  seniority?: Seniority;
  seniorities?: Seniority[];
  modality?: WorkModality;
  modalities?: WorkModality[];
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
  visibility?: JobVisibilityFilter;
  priority?: JobPriorityFilter;
  sources?: JobSource[];
  suggested?: boolean;
  strictProfileMatch?: boolean;
};

export type ApplicationListParams = {
  cursor?: string;
  limit?: number;
  stage?: PipelineStage;
  companyId?: string;
  q?: string;
};

export type NotificationListParams = {
  cursor?: string;
  limit?: number;
  read?: boolean;
  type?: NotificationType;
  category?: NotificationCategory;
  q?: string;
};

export type CompanyListParams = {
  cursor?: string;
  limit?: number;
  q?: string;
};
