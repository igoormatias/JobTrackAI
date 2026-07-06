import { getJobSearchHints, type JobSearchHints } from "@/features/account/services";
import type { ProfessionalArea, Seniority, WorkModality } from "@/types";

import type { useJobFilters } from "../hooks/use-job-filters";

type FilterState = ReturnType<typeof useJobFilters>["urlState"];

export const fetchProfileJobSearchHints = (): Promise<JobSearchHints> => getJobSearchHints();

export const mapJobSearchHintsToFilters = (hints: JobSearchHints): Partial<FilterState> => {
  const filters: Partial<FilterState> = {
    sort: "match",
    dir: "desc",
  };

  if (hints.area) {
    filters.areas = [hints.area as ProfessionalArea];
  }

  if (hints.seniority) {
    filters.seniorities = [hints.seniority as Seniority];
  }

  if (hints.modality && hints.modality !== "any") {
    filters.modalities = [hints.modality as WorkModality];
  }

  if (hints.skillNames.length > 0) {
    filters.skills = hints.skillNames;
  }

  if (hints.location) {
    filters.location = hints.location;
  }

  if (hints.titleHints[0]) {
    filters.search = hints.titleHints[0];
  }

  if (hints.salaryExpectation?.min) {
    filters.salaryMin = hints.salaryExpectation.min;
  }

  return filters;
};

export const hasProfileDefaultFilters = (defaults: Partial<FilterState>): boolean =>
  Boolean(
    defaults.areas?.length ||
      defaults.seniorities?.length ||
      defaults.modalities?.length ||
      defaults.skills?.length ||
      defaults.location ||
      defaults.search ||
      defaults.salaryMin != null,
  );

export const loadProfileDefaultFilters = async (): Promise<Partial<FilterState>> => {
  const hints = await fetchProfileJobSearchHints();
  return mapJobSearchHintsToFilters(hints);
};
