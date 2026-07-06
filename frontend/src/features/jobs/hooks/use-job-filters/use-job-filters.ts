"use client";

import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { JobSortField, JobSource, ProfessionalArea, Seniority, SortDirection, WorkModality } from "@/types";

import {
  DEFAULT_JOB_SORT,
  DEFAULT_JOB_SORT_DIRECTION,
} from "../../constants/jobs-constants";
import type { JobUrlFilters } from "../../types/job-url-filters";
import { hasActiveJobFilters, urlFiltersToJobListParams } from "../../utils/job-list-params";
import {
  hasProfileDefaultFilters,
  JOBS_SKIP_PROFILE_DEFAULTS_KEY,
  loadProfileDefaultFilters,
  shouldSkipProfileDefaults,
} from "../../utils/profile-default-filters";

const sortValues = ["recent", "match", "date", "salary", "company", "title", "priority"] as const;
const dirValues = ["asc", "desc"] as const;

const jobFiltersParsers = {
  search: parseAsString.withDefault(""),
  sort: parseAsStringLiteral(sortValues).withDefault(DEFAULT_JOB_SORT),
  dir: parseAsStringLiteral(dirValues).withDefault(DEFAULT_JOB_SORT_DIRECTION),
  areas: parseAsArrayOf(parseAsString).withDefault([]),
  companyIds: parseAsArrayOf(parseAsString).withDefault([]),
  seniorities: parseAsArrayOf(parseAsString).withDefault([]),
  modalities: parseAsArrayOf(parseAsString).withDefault([]),
  location: parseAsString.withDefault(""),
  locationScope: parseAsStringLiteral(["country", "state", "city"] as const),
  locationState: parseAsString.withDefault(""),
  locationCity: parseAsString.withDefault(""),
  suggested: parseAsBoolean,
  salaryMin: parseAsInteger,
  salaryMax: parseAsInteger,
  skills: parseAsArrayOf(parseAsString).withDefault([]),
  matchMin: parseAsInteger,
  dateFrom: parseAsString,
  dateTo: parseAsString,
  isFavorite: parseAsBoolean,
  sources: parseAsArrayOf(parseAsString).withDefault([]),
};

export const useJobFilters = () => {
  const [urlState, setUrlState] = useQueryStates(jobFiltersParsers, {
    history: "replace",
    shallow: true,
  });

  const [searchDraft, setSearchDraft] = useState(urlState.search);
  const debouncedSearch = useDebouncedValue(searchDraft, 300);
  const previousUrlSearch = useRef(urlState.search);

  useEffect(() => {
    if (urlState.search !== debouncedSearch) {
      void setUrlState({ search: debouncedSearch });
    }
  }, [debouncedSearch, setUrlState, urlState.search]);

  useEffect(() => {
    if (previousUrlSearch.current !== urlState.search) {
      setSearchDraft(urlState.search);
      previousUrlSearch.current = urlState.search;
    }
  }, [urlState.search]);

  const urlFilters = useMemo<JobUrlFilters>(
    () => ({
      search: debouncedSearch || undefined,
      sort: urlState.sort as JobSortField,
      dir: urlState.dir as SortDirection,
      areas: urlState.areas.length ? (urlState.areas as ProfessionalArea[]) : undefined,
      companyIds: urlState.companyIds.length ? urlState.companyIds : undefined,
      seniorities: urlState.seniorities.length ? (urlState.seniorities as Seniority[]) : undefined,
      modalities: urlState.modalities.length ? (urlState.modalities as WorkModality[]) : undefined,
      location: urlState.location || undefined,
      locationScope: urlState.locationScope ?? undefined,
      locationState: urlState.locationState || undefined,
      locationCity: urlState.locationCity || undefined,
      suggested: urlState.suggested ?? undefined,
      salaryMin: urlState.salaryMin ?? undefined,
      salaryMax: urlState.salaryMax ?? undefined,
      skills: urlState.skills.length ? urlState.skills : undefined,
      matchMin: urlState.matchMin ?? undefined,
      dateFrom: urlState.dateFrom ?? undefined,
      dateTo: urlState.dateTo ?? undefined,
      isFavorite: urlState.isFavorite ?? undefined,
      sources: urlState.sources.length ? (urlState.sources as JobSource[]) : undefined,
    }),
    [debouncedSearch, urlState],
  );

  const listParams = useMemo(() => urlFiltersToJobListParams(urlFilters), [urlFilters]);

  const clearFilters = (options?: { skipProfileDefaults?: boolean }) => {
    if (options?.skipProfileDefaults && typeof window !== "undefined") {
      sessionStorage.setItem("jobs:skipProfileDefaults", "1");
    }
    setSearchDraft("");
    void setUrlState({
      search: "",
      sort: DEFAULT_JOB_SORT,
      dir: DEFAULT_JOB_SORT_DIRECTION,
      areas: [],
      companyIds: [],
      seniorities: [],
      modalities: [],
      location: "",
      locationScope: null,
      locationState: "",
      locationCity: "",
      suggested: null,
      salaryMin: null,
      salaryMax: null,
      skills: [],
      matchMin: null,
      dateFrom: null,
      dateTo: null,
      isFavorite: null,
      sources: [],
    });
  };

  const applyProfileDefaults = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(JOBS_SKIP_PROFILE_DEFAULTS_KEY);
    }
    const defaults = await loadProfileDefaultFilters();
    if (!hasProfileDefaultFilters(defaults)) return;
    if (defaults.search) {
      setSearchDraft(defaults.search);
    }
    await setUrlState(defaults);
  };

  return {
    urlState,
    setUrlState,
    setFilters: setUrlState,
    urlFilters,
    listParams,
    hasActiveFilters: hasActiveJobFilters(urlFilters),
    clearFilters,
    applyProfileDefaults,
    canApplyProfileDefaults: shouldSkipProfileDefaults() && !urlState.suggested,
    searchInputValue: searchDraft,
    setSearchInputValue: setSearchDraft,
  };
};
