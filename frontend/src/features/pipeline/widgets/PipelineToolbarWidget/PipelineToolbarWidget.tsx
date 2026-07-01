"use client";

import { PipelineToolbar } from "../../components/PipelineToolbar";
import { usePipelineFilters } from "../../hooks/use-pipeline-filters";

export const PipelineToolbarWidget = () => {
  const { urlFilters, hasActiveFilters, setUrlState, clearFilters } = usePipelineFilters();

  return (
    <PipelineToolbar
      search={urlFilters.search ?? ""}
      sortBy={urlFilters.sortBy ?? "updated"}
      sortDirection={urlFilters.sortDirection ?? "desc"}
      onSearchChange={(value) => void setUrlState({ search: value })}
      onSortByChange={(value) =>
        void setUrlState({ sortBy: value as "recent" | "match" | "company" | "updated" })
      }
      onSortDirectionChange={(value) => void setUrlState({ dir: value as "asc" | "desc" })}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};
