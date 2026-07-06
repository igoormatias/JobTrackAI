import type { Job, JobListParams } from "@/types";

const includesQuery = (job: Job, query: string): boolean =>
  job.title.toLowerCase().includes(query) ||
  job.company.name.toLowerCase().includes(query) ||
  job.location.toLowerCase().includes(query) ||
  job.technologies.some((tech) => tech.name.toLowerCase().includes(query)) ||
  job.requirements.some((req) => req.toLowerCase().includes(query));

const resolveAreas = (params: JobListParams) =>
  params.areas?.length ? params.areas : params.area ? [params.area] : undefined;

const resolveSeniorities = (params: JobListParams) =>
  params.seniorities?.length ? params.seniorities : params.seniority ? [params.seniority] : undefined;

const resolveModalities = (params: JobListParams) =>
  params.modalities?.length ? params.modalities : params.modality ? [params.modality] : undefined;

const resolveCompanyIds = (params: JobListParams) =>
  params.companyIds?.length ? params.companyIds : params.companyId ? [params.companyId] : undefined;

export const filterJobs = (jobs: Job[], params: JobListParams): Job[] => {
  let result = [...jobs];

  if (params.q) {
    const query = params.q.toLowerCase();
    result = result.filter((job) => includesQuery(job, query));
  }

  if (params.role) {
    const role = params.role.toLowerCase();
    result = result.filter((job) => job.title.toLowerCase().includes(role));
  }

  const companyIds = resolveCompanyIds(params);
  if (companyIds?.length) {
    result = result.filter((job) => companyIds.includes(job.companyId));
  }

  const areas = resolveAreas(params);
  if (areas?.length) {
    result = result.filter((job) => areas.includes(job.area));
  }

  const seniorities = resolveSeniorities(params);
  if (seniorities?.length) {
    result = result.filter((job) => seniorities.includes(job.seniority));
  }

  const modalities = resolveModalities(params);
  if (modalities?.length) {
    result = result.filter((job) => modalities.includes(job.modality));
  }

  if (params.location) {
    const location = params.location.toLowerCase();
    result = result.filter((job) => job.location.toLowerCase().includes(location));
  }

  if (params.salaryMin !== undefined && params.salaryMin > 0) {
    result = result.filter(
      (job) =>
        (job.salaryMin === null && job.salaryMax === null) ||
        (job.salaryMax ?? 0) >= params.salaryMin!,
    );
  }

  if (params.salaryMax !== undefined && params.salaryMax > 0) {
    result = result.filter(
      (job) =>
        (job.salaryMin === null && job.salaryMax === null) ||
        (job.salaryMin ?? Number.MAX_SAFE_INTEGER) <= params.salaryMax!,
    );
  }

  if (params.skills?.length) {
    result = result.filter((job) =>
      params.skills!.every((skill) =>
        job.technologies.some((tech) => tech.slug === skill || tech.name.toLowerCase() === skill.toLowerCase()),
      ),
    );
  }

  if (params.matchMin !== undefined) {
    result = result.filter((job) => job.matchScore.score >= params.matchMin!);
  }

  if (params.dateFrom) {
    result = result.filter((job) => new Date(job.publishedAt) >= new Date(params.dateFrom!));
  }

  if (params.dateTo) {
    result = result.filter((job) => new Date(job.publishedAt) <= new Date(params.dateTo!));
  }

  if (params.isFavorite !== undefined) {
    result = result.filter((job) => job.isFavorite === params.isFavorite);
  }

  if (params.sources?.length) {
    result = result.filter((job) => params.sources!.includes(job.source));
  }

  const sortBy = params.sortBy ?? "match";
  const direction = params.sortDirection === "asc" ? 1 : -1;

  result.sort((a, b) => {
    switch (sortBy) {
      case "match":
        return (a.matchScore.score - b.matchScore.score) * direction;
      case "salary":
        return ((a.salaryMax ?? 0) - (b.salaryMax ?? 0)) * direction;
      case "title":
        return a.title.localeCompare(b.title) * direction;
      case "company":
        return a.company.name.localeCompare(b.company.name) * direction;
      case "date":
      default:
        return (new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()) * direction;
    }
  });

  return result;
};

const parseCsv = (value: string | null): string[] | undefined => {
  if (!value) return undefined;
  const items = value.split(",").map((item) => item.trim()).filter(Boolean);
  return items.length > 0 ? items : undefined;
};

export const parseJobListParams = (searchParams: URLSearchParams): JobListParams => ({
  cursor: searchParams.get("cursor") ?? undefined,
  limit: Number(searchParams.get("limit") ?? 20) || 20,
  sortBy: (searchParams.get("sortBy") as JobListParams["sortBy"]) ?? undefined,
  sortDirection: (searchParams.get("sortDirection") as JobListParams["sortDirection"]) ?? undefined,
  q: searchParams.get("q") ?? searchParams.get("search") ?? undefined,
  role: searchParams.get("role") ?? undefined,
  companyId: searchParams.get("companyId") ?? undefined,
  companyIds: parseCsv(searchParams.get("companyIds")),
  area: (searchParams.get("area") as JobListParams["area"]) ?? undefined,
  areas: parseCsv(searchParams.get("areas")) as JobListParams["areas"],
  seniority: (searchParams.get("seniority") as JobListParams["seniority"]) ?? undefined,
  seniorities: parseCsv(searchParams.get("seniorities")) as JobListParams["seniorities"],
  modality: (searchParams.get("modality") as JobListParams["modality"]) ?? undefined,
  modalities: parseCsv(searchParams.get("modalities")) as JobListParams["modalities"],
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
  sources: parseCsv(searchParams.get("sources")) as JobListParams["sources"],
});

export const getJobSortValue = (job: Job, sortBy: JobListParams["sortBy"] = "match"): string | number => {
  switch (sortBy) {
    case "match":
      return job.matchScore.score;
    case "salary":
      return job.salaryMax ?? 0;
    case "title":
      return job.title;
    case "company":
      return job.company.name;
    case "date":
    default:
      return job.publishedAt;
  }
};
