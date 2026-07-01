"use client";

import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useMemo } from "react";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import type { PipelineStage } from "@/types";

import { hasActivePipelineFilters, urlFiltersToPipelineParams } from "../../utils/pipeline-list-params";
import type { PipelineUrlFilters } from "../../types/pipeline-url-filters";

const stageValues = [
  "favorite",
  "applied",
  "hr",
  "technical_interview",
  "manager",
  "client",
  "offer",
  "hired",
  "rejected",
] as const;

const sortValues = ["recent", "match", "company", "updated"] as const;
const dirValues = ["asc", "desc"] as const;

const pipelineFiltersParsers = {
  search: parseAsString.withDefault(""),
  companyId: parseAsString,
  stage: parseAsStringLiteral(stageValues),
  area: parseAsString,
  technology: parseAsString,
  matchMin: parseAsInteger,
  isFavorite: parseAsBoolean,
  sortBy: parseAsStringLiteral(sortValues).withDefault("updated"),
  dir: parseAsStringLiteral(dirValues).withDefault("desc"),
};

export const usePipelineFilters = () => {
  const [urlState, setUrlState] = useQueryStates(pipelineFiltersParsers, {
    history: "replace",
    shallow: true,
  });

  const debouncedSearch = useDebouncedValue(urlState.search, 300);

  const urlFilters = useMemo<PipelineUrlFilters>(
    () => ({
      search: debouncedSearch || undefined,
      companyId: urlState.companyId ?? undefined,
      stage: (urlState.stage as PipelineStage) ?? undefined,
      area: urlState.area ?? undefined,
      technology: urlState.technology ?? undefined,
      matchMin: urlState.matchMin ?? undefined,
      isFavorite: urlState.isFavorite ?? undefined,
      sortBy: urlState.sortBy,
      sortDirection: urlState.dir,
    }),
    [debouncedSearch, urlState],
  );

  const listParams = useMemo(() => urlFiltersToPipelineParams(urlFilters), [urlFilters]);

  const clearFilters = () => {
    void setUrlState({
      search: "",
      companyId: null,
      stage: null,
      area: null,
      technology: null,
      matchMin: null,
      isFavorite: null,
      sortBy: "updated",
      dir: "desc",
    });
  };

  return {
    urlFilters,
    listParams,
    hasActiveFilters: hasActivePipelineFilters(urlFilters),
    setUrlState,
    clearFilters,
  };
};
