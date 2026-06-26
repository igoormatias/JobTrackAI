import type { JobSortField, SortDirection } from "./api";
import type { NotificationType } from "./notification";
import type { PipelineStage } from "./application";
import type { ProfessionalArea, Seniority, WorkModality } from "./profile";

export type JobListParams = {
  cursor?: string;
  limit?: number;
  sortBy?: JobSortField;
  sortDirection?: SortDirection;
  q?: string;
  role?: string;
  companyId?: string;
  area?: ProfessionalArea;
  seniority?: Seniority;
  modality?: WorkModality;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  matchMin?: number;
  dateFrom?: string;
  dateTo?: string;
  isFavorite?: boolean;
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
};

export type CompanyListParams = {
  cursor?: string;
  limit?: number;
  q?: string;
};
