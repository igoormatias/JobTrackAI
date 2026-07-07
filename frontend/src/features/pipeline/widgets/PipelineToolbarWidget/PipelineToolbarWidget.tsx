"use client";

import { PipelineToolbar } from "../../components/PipelineToolbar";
import { usePipelineDensity } from "../../hooks/use-pipeline-density";
import { usePipelineFilters } from "../../hooks/use-pipeline-filters";

export const PipelineToolbarWidget = () => {
  const { urlFilters, hasActiveFilters, setUrlState, clearFilters } = usePipelineFilters();
  const { isCompact, toggleCompact } = usePipelineDensity();

  return (
    <PipelineToolbar
      search={urlFilters.search ?? ""}
      sortBy={urlFilters.sortBy ?? "updated"}
      sortDirection={urlFilters.sortDirection ?? "desc"}
      isFavoriteOnly={urlFilters.isFavorite === true}
      isCompact={isCompact}
      onSearchChange={(value) => void setUrlState({ search: value })}
      onSortByChange={(value) =>
        void setUrlState({
          sortBy: value as
            | "recent"
            | "match"
            | "company"
            | "updated"
            | "favorite"
            | "priority"
            | "salary",
        })
      }
      onSortDirectionChange={(value) => void setUrlState({ dir: value as "asc" | "desc" })}
      onFavoriteOnlyChange={(value) => void setUrlState({ isFavorite: value ? true : null })}
      onCompactToggle={toggleCompact}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
};
