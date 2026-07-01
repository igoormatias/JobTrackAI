import type { PipelineListParams } from "@/types";

import type { PipelineUrlFilters } from "../types/pipeline-url-filters";

export const urlFiltersToPipelineParams = (filters: PipelineUrlFilters): PipelineListParams => ({
  q: filters.search,
  companyId: filters.companyId,
  stage: filters.stage,
  area: filters.area,
  technology: filters.technology,
  matchMin: filters.matchMin,
  isFavorite: filters.isFavorite,
  sortBy: filters.sortBy,
  sortDirection: filters.sortDirection,
});

export const hasActivePipelineFilters = (filters: PipelineUrlFilters): boolean =>
  Boolean(
    filters.search ||
      filters.companyId ||
      filters.stage ||
      filters.area ||
      filters.technology ||
      filters.matchMin ||
      filters.isFavorite !== undefined,
  );
