import { normalizeCompanyFilterValues } from "../../../shared/utils/company-filter.utils.js";
import type { JobListQuery } from "../schemas/job.schema.js";
import type { JobListParams } from "../types/job.types.js";

const toArray = (value?: string | string[]): string[] | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
};

const mergeSingular = (
  plural?: string | string[],
  singular?: string,
): string[] | undefined => {
  const fromPlural = toArray(plural);
  if (fromPlural?.length) return fromPlural;
  if (singular?.trim()) return [singular.trim()];
  return undefined;
};

export { normalizeCompanyFilterValues } from "../../../shared/utils/company-filter.utils.js";

export const normalizeJobListParams = (query: JobListQuery): JobListParams => ({
  ...query,
  areas: mergeSingular(query.areas, query.area),
  companyIds: normalizeCompanyFilterValues(mergeSingular(query.companyIds, query.companyId)),
  seniorities: mergeSingular(query.seniorities, query.seniority),
  modalities: mergeSingular(query.modalities, query.modality),
  skills: toArray(query.skills),
  sources: toArray(query.sources) as JobListParams["sources"],
});
