import { getJobSearchHints, type JobSearchHints } from "@/features/account/services";
import type { ProfessionalArea, Seniority, WorkModality } from "@/types";

import type { useJobFilters } from "../hooks/use-job-filters";

type FilterState = ReturnType<typeof useJobFilters>["urlState"];

const PROFILE_SKILLS_LIMIT = 3;

export const JOBS_SKIP_PROFILE_DEFAULTS_KEY = "jobs:skipProfileDefaults";

export const shouldSkipProfileDefaults = (): boolean => {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(JOBS_SKIP_PROFILE_DEFAULTS_KEY) === "1";
};

export const fetchProfileJobSearchHints = (): Promise<JobSearchHints> => getJobSearchHints();

export const mapJobSearchHintsToFilters = (hints: JobSearchHints): Partial<FilterState> => {
  const filters: Partial<FilterState> = {
    suggested: true,
  };

  if (hints.area && hints.seniority) {
    filters.sort = "match";
    filters.dir = "desc";
  } else {
    filters.sort = "recent";
    filters.dir = "desc";
  }

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
    filters.skills = hints.skillNames.slice(0, PROFILE_SKILLS_LIMIT);
  }

  if (hints.locationPreference) {
    const { scope, state, city } = hints.locationPreference;
    if (scope === "country") {
      filters.locationScope = "country";
      filters.location = "";
    } else if (scope === "state" && state) {
      filters.locationScope = "state";
      filters.locationState = state;
      filters.location = "";
    } else if (scope === "city" && city) {
      filters.locationScope = "city";
      filters.locationCity = city;
      filters.locationState = state ?? "";
      filters.location = city;
    }
  }

  if (hints.titleHints[0]) {
    filters.search = hints.titleHints[0];
  }

  return filters;
};

export const hasProfileDefaultFilters = (defaults: Partial<FilterState>): boolean =>
  Boolean(
    defaults.suggested ||
      defaults.areas?.length ||
      defaults.seniorities?.length ||
      defaults.modalities?.length ||
      defaults.skills?.length ||
      defaults.locationScope ||
      defaults.location ||
      defaults.search,
  );

export const loadProfileDefaultFilters = async (): Promise<Partial<FilterState>> => {
  const hints = await fetchProfileJobSearchHints();
  return mapJobSearchHintsToFilters(hints);
};
