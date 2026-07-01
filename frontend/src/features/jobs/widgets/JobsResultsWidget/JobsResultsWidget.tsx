"use client";

import type { Job, JobSortField, SortDirection } from "@/types";

import { JobsEmptyState, type JobsEmptyStateVariant } from "../../components/JobsEmptyState";
import { JobsList } from "../../components/JobsList";
import { JobsResultsHeader } from "../../components/JobsResultsHeader";

export type JobsResultsWidgetProps = {
  jobs: Job[];
  total: number;
  sort: JobSortField;
  direction: SortDirection;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  emptyVariant: JobsEmptyStateVariant;
  onSortChange: (sort: JobSortField) => void;
  onDirectionChange: (direction: SortDirection) => void;
  onLoadMore: () => void;
  onFavorite: (job: Job) => void;
  onApply: (job: Job) => void;
  onViewDetails: (job: Job) => void;
  onClearFilters?: () => void;
  onRetry?: () => void;
  favoritePendingId?: string;
  applyPendingId?: string;
};

export const JobsResultsWidget = ({
  jobs,
  total,
  sort,
  direction,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  emptyVariant,
  onSortChange,
  onDirectionChange,
  onLoadMore,
  onFavorite,
  onApply,
  onViewDetails,
  onClearFilters,
  onRetry,
  favoritePendingId,
  applyPendingId,
}: JobsResultsWidgetProps) => {
  if (isError) {
    return <JobsEmptyState variant="error" onRetry={onRetry} />;
  }

  if (!isLoading && jobs.length === 0) {
    return <JobsEmptyState variant={emptyVariant} onClearFilters={onClearFilters} />;
  }

  return (
    <div className="space-y-4">
      <JobsResultsHeader
        total={total}
        sort={sort}
        direction={direction}
        onSortChange={onSortChange}
        onDirectionChange={onDirectionChange}
      />
      <JobsList
        jobs={jobs}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onLoadMore={onLoadMore}
        onFavorite={onFavorite}
        onApply={onApply}
        onViewDetails={onViewDetails}
        favoritePendingId={favoritePendingId}
        applyPendingId={applyPendingId}
      />
    </div>
  );
};
