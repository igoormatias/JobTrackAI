import type { JobListQuery } from "../schemas/job.schema.js";
import type { JobListParams } from "../types/job.types.js";

const toArray = (value?: string | string[]): string[] | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
};

export const normalizeJobListParams = (query: JobListQuery): JobListParams => ({
  ...query,
  areas: toArray(query.areas),
  companyIds: toArray(query.companyIds),
  seniorities: toArray(query.seniorities),
  modalities: toArray(query.modalities),
  skills: toArray(query.skills),
  sources: toArray(query.sources) as JobListParams["sources"],
});
