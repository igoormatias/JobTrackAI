"use client";

import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useMemo } from "react";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { JobSortField, JobSource, ProfessionalArea, Seniority, SortDirection, WorkModality } from "@/types";

import {
  DEFAULT_JOB_SORT,
  DEFAULT_JOB_SORT_DIRECTION,
} from "../../constants/jobs-constants";
import type { JobUrlFilters } from "../../types/job-url-filters";
import { hasActiveJobFilters, urlFiltersToJobListParams } from "../../utils/job-list-params";

const sortValues = ["match", "date", "salary", "company", "title", "priority"] as const;
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

  const debouncedSearch = useDebouncedValue(urlState.search, 300);

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

  const clearFilters = () => {
    void setUrlState({
      search: "",
      sort: DEFAULT_JOB_SORT,
      dir: DEFAULT_JOB_SORT_DIRECTION,
      areas: [],
      companyIds: [],
      seniorities: [],
      modalities: [],
      location: "",
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

  return {
    urlState,
    setUrlState,
    urlFilters,
    listParams,
    hasActiveFilters: hasActiveJobFilters(urlFilters),
    clearFilters,
    searchInputValue: urlState.search,
    setSearchInputValue: (value: string) => void setUrlState({ search: value }),
  };
};
