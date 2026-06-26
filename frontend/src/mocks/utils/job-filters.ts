import type { Job, JobListParams } from "@/types";

export const filterJobs = (jobs: Job[], params: JobListParams): Job[] => {
  let result = [...jobs];

  if (params.q) {
    const query = params.q.toLowerCase();
    result = result.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        job.technologies.some((tech) => tech.name.toLowerCase().includes(query)) ||
        job.requirements.some((req) => req.toLowerCase().includes(query)),
    );
  }

  if (params.role) {
    const role = params.role.toLowerCase();
    result = result.filter((job) => job.title.toLowerCase().includes(role));
  }

  if (params.companyId) {
    result = result.filter((job) => job.companyId === params.companyId);
  }

  if (params.area) {
    result = result.filter((job) => job.area === params.area);
  }

  if (params.seniority) {
    result = result.filter((job) => job.seniority === params.seniority);
  }

  if (params.modality) {
    result = result.filter((job) => job.modality === params.modality);
  }

  if (params.location) {
    const location = params.location.toLowerCase();
    result = result.filter((job) => job.location.toLowerCase().includes(location));
  }

  if (params.salaryMin !== undefined) {
    result = result.filter((job) => (job.salaryMax ?? 0) >= params.salaryMin!);
  }

  if (params.salaryMax !== undefined) {
    result = result.filter((job) => (job.salaryMin ?? Number.MAX_SAFE_INTEGER) <= params.salaryMax!);
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

  const sortBy = params.sortBy ?? "date";
  const direction = params.sortDirection === "asc" ? 1 : -1;

  result.sort((a, b) => {
    switch (sortBy) {
      case "match":
        return (a.matchScore.score - b.matchScore.score) * direction;
      case "salary":
        return ((a.salaryMax ?? 0) - (b.salaryMax ?? 0)) * direction;
      case "title":
        return a.title.localeCompare(b.title) * direction;
      case "date":
      default:
        return (new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()) * direction;
    }
  });

  return result;
};

export const parseJobListParams = (searchParams: URLSearchParams): JobListParams => ({
  cursor: searchParams.get("cursor") ?? undefined,
  limit: Number(searchParams.get("limit") ?? 20) || 20,
  sortBy: (searchParams.get("sortBy") as JobListParams["sortBy"]) ?? undefined,
  sortDirection: (searchParams.get("sortDirection") as JobListParams["sortDirection"]) ?? undefined,
  q: searchParams.get("q") ?? undefined,
  role: searchParams.get("role") ?? undefined,
  companyId: searchParams.get("companyId") ?? undefined,
  area: (searchParams.get("area") as JobListParams["area"]) ?? undefined,
  seniority: (searchParams.get("seniority") as JobListParams["seniority"]) ?? undefined,
  modality: (searchParams.get("modality") as JobListParams["modality"]) ?? undefined,
  location: searchParams.get("location") ?? undefined,
  salaryMin: searchParams.get("salaryMin") ? Number(searchParams.get("salaryMin")) : undefined,
  salaryMax: searchParams.get("salaryMax") ? Number(searchParams.get("salaryMax")) : undefined,
  skills: searchParams.get("skills")?.split(",").filter(Boolean),
  matchMin: searchParams.get("matchMin") ? Number(searchParams.get("matchMin")) : undefined,
  dateFrom: searchParams.get("dateFrom") ?? undefined,
  dateTo: searchParams.get("dateTo") ?? undefined,
  isFavorite: searchParams.get("isFavorite") === "true" ? true : searchParams.get("isFavorite") === "false" ? false : undefined,
});
