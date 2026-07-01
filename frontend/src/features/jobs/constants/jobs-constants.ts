import type { JobSortField, JobSource, ProfessionalArea, Seniority, SortDirection, WorkModality } from "@/types";

export const JOB_SORT_OPTIONS: { value: JobSortField; label: string }[] = [
  { value: "match", label: "Maior Match" },
  { value: "date", label: "Mais recentes" },
  { value: "salary", label: "Maior salário" },
  { value: "company", label: "Empresa" },
  { value: "title", label: "Nome da vaga" },
];

export const JOB_SOURCE_OPTIONS: { value: JobSource; label: string }[] = [
  { value: "gupy", label: "Gupy" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "programathor", label: "ProgramaThor" },
  { value: "internal", label: "Interna" },
];

export const JOB_AREA_OPTIONS: { value: ProfessionalArea; label: string }[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "full_stack", label: "Full Stack" },
  { value: "mobile", label: "Mobile" },
  { value: "qa", label: "QA" },
  { value: "devops", label: "DevOps" },
  { value: "product_owner", label: "Product Owner" },
  { value: "product_manager", label: "Product Manager" },
  { value: "scrum_master", label: "Scrum Master" },
  { value: "ux_ui", label: "UX/UI" },
  { value: "data_engineer", label: "Data Engineer" },
  { value: "data_analyst", label: "Data Analyst" },
  { value: "tech_lead", label: "Tech Lead" },
  { value: "business_analyst", label: "Business Analyst" },
  { value: "agile_coach", label: "Agile Coach" },
  { value: "other", label: "Outra" },
];

export const JOB_SENIORITY_OPTIONS: { value: Seniority; label: string }[] = [
  { value: "intern", label: "Estágio" },
  { value: "junior", label: "Júnior" },
  { value: "mid", label: "Pleno" },
  { value: "senior", label: "Sênior" },
  { value: "lead", label: "Lead" },
  { value: "staff", label: "Staff" },
];

export const JOB_MODALITY_OPTIONS: { value: WorkModality; label: string }[] = [
  { value: "remote", label: "Remoto" },
  { value: "hybrid", label: "Híbrido" },
  { value: "onsite", label: "Presencial" },
];

export const JOB_ENGAGEMENT_LABELS = {
  new: "Nova",
  viewed: "Visualizada",
  favorited: "Favoritada",
  applied: "Aplicada",
  rejected: "Rejeitada",
} as const;

export const DEFAULT_JOB_LIST_LIMIT = 20;

export const DEFAULT_JOB_SORT: JobSortField = "match";
export const DEFAULT_JOB_SORT_DIRECTION: SortDirection = "desc";

export const JOBS_LAYOUT = {
  page: "space-y-6",
  toolbar: "space-y-4",
  list: "grid grid-cols-1 gap-4 lg:grid-cols-2",
} as const;
