import type { JobSortField, JobSource, ProfessionalArea, Seniority, SortDirection, WorkModality } from "@/types";

export type JobUrlFilters = {
  search?: string;
  sort?: JobSortField;
  dir?: SortDirection;
  areas?: ProfessionalArea[];
  companyIds?: string[];
  seniorities?: Seniority[];
  modalities?: WorkModality[];
  location?: string;
  locationScope?: "country" | "state" | "city";
  locationState?: string;
  locationCity?: string;
  suggested?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  matchMin?: number;
  dateFrom?: string;
  dateTo?: string;
  isFavorite?: boolean;
  sources?: JobSource[];
};
