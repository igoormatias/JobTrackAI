import type { JobListParams } from "@/types";

import type { JobUrlFilters } from "../types/job-url-filters";

const parseCsv = (value: string | null | undefined): string[] | undefined => {
  if (!value) return undefined;
  const items = value.split(",").map((item) => item.trim()).filter(Boolean);
  return items.length > 0 ? items : undefined;
};

const serializeCsv = (values: string[] | undefined): string | undefined =>
  values && values.length > 0 ? values.join(",") : undefined;

export const urlFiltersToJobListParams = (filters: JobUrlFilters): JobListParams => ({
  q: filters.search || undefined,
  sortBy: filters.sort ?? "recent",
  sortDirection: filters.dir ?? "desc",
  areas: filters.areas,
  companyIds: filters.companyIds,
  seniorities: filters.seniorities,
  modalities: filters.modalities,
  location: filters.location || undefined,
  locationScope: filters.locationScope,
  locationState: filters.locationState || undefined,
  locationCity: filters.locationCity || undefined,
  salaryMin: filters.salaryMin && filters.salaryMin > 0 ? filters.salaryMin : undefined,
  salaryMax: filters.salaryMax && filters.salaryMax > 0 ? filters.salaryMax : undefined,
  skills: filters.skills,
  matchMin: filters.matchMin,
  dateFrom: filters.dateFrom || undefined,
  dateTo: filters.dateTo || undefined,
  isFavorite: filters.isFavorite,
  sources: filters.sources,
});

export const jobListParamsToUrlFilters = (params: JobListParams): JobUrlFilters => ({
  search: params.q,
  sort: params.sortBy,
  dir: params.sortDirection,
  areas: params.areas ?? (params.area ? [params.area] : undefined),
  companyIds: params.companyIds ?? (params.companyId ? [params.companyId] : undefined),
  seniorities: params.seniorities ?? (params.seniority ? [params.seniority] : undefined),
  modalities: params.modalities ?? (params.modality ? [params.modality] : undefined),
  location: params.location,
  locationScope: params.locationScope,
  locationState: params.locationState,
  locationCity: params.locationCity,
  salaryMin: params.salaryMin,
  salaryMax: params.salaryMax,
  skills: params.skills,
  matchMin: params.matchMin,
  dateFrom: params.dateFrom,
  dateTo: params.dateTo,
  isFavorite: params.isFavorite,
  sources: params.sources,
});

export const parseJobUrlSearchParams = (searchParams: URLSearchParams): JobUrlFilters => ({
  search: searchParams.get("search") ?? undefined,
  sort: (searchParams.get("sort") as JobUrlFilters["sort"]) ?? undefined,
  dir: (searchParams.get("dir") as JobUrlFilters["dir"]) ?? undefined,
  areas: parseCsv(searchParams.get("areas")) as JobUrlFilters["areas"],
  companyIds: parseCsv(searchParams.get("companyIds")),
  seniorities: parseCsv(searchParams.get("seniorities")) as JobUrlFilters["seniorities"],
  modalities: parseCsv(searchParams.get("modalities")) as JobUrlFilters["modalities"],
  location: searchParams.get("location") ?? undefined,
  salaryMin: searchParams.get("salaryMin") ? Number(searchParams.get("salaryMin")) : undefined,
  salaryMax: searchParams.get("salaryMax") ? Number(searchParams.get("salaryMax")) : undefined,
  skills: parseCsv(searchParams.get("skills")),
  matchMin: searchParams.get("matchMin") ? Number(searchParams.get("matchMin")) : undefined,
  dateFrom: searchParams.get("dateFrom") ?? undefined,
  dateTo: searchParams.get("dateTo") ?? undefined,
  isFavorite:
    searchParams.get("isFavorite") === "true"
      ? true
      : searchParams.get("isFavorite") === "false"
        ? false
        : undefined,
  sources: parseCsv(searchParams.get("sources")) as JobUrlFilters["sources"],
});

export const serializeJobUrlSearchParams = (filters: JobUrlFilters): Record<string, string> => {
  const entries: Record<string, string> = {};

  if (filters.search) entries.search = filters.search;
  if (filters.sort && filters.sort !== "match") entries.sort = filters.sort;
  if (filters.dir && filters.dir !== "desc") entries.dir = filters.dir;
  if (filters.areas?.length) entries.areas = serializeCsv(filters.areas)!;
  if (filters.companyIds?.length) entries.companyIds = serializeCsv(filters.companyIds)!;
  if (filters.seniorities?.length) entries.seniorities = serializeCsv(filters.seniorities)!;
  if (filters.modalities?.length) entries.modalities = serializeCsv(filters.modalities)!;
  if (filters.location) entries.location = filters.location;
  if (filters.salaryMin !== undefined && filters.salaryMin > 0) entries.salaryMin = String(filters.salaryMin);
  if (filters.salaryMax !== undefined && filters.salaryMax > 0) entries.salaryMax = String(filters.salaryMax);
  if (filters.skills?.length) entries.skills = serializeCsv(filters.skills)!;
  if (filters.matchMin !== undefined) entries.matchMin = String(filters.matchMin);
  if (filters.dateFrom) entries.dateFrom = filters.dateFrom;
  if (filters.dateTo) entries.dateTo = filters.dateTo;
  if (filters.isFavorite !== undefined) entries.isFavorite = String(filters.isFavorite);
  if (filters.sources?.length) entries.sources = serializeCsv(filters.sources)!;

  return entries;
};

export const hasActiveJobFilters = (filters: JobUrlFilters): boolean =>
  Boolean(
    filters.search ||
      filters.areas?.length ||
      filters.companyIds?.length ||
      filters.seniorities?.length ||
      filters.modalities?.length ||
      filters.locationScope ||
      filters.location ||
      (filters.salaryMin !== undefined && filters.salaryMin > 0) ||
      (filters.salaryMax !== undefined && filters.salaryMax > 0) ||
      filters.skills?.length ||
      filters.matchMin !== undefined ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.isFavorite !== undefined ||
      filters.sources?.length,
  );
