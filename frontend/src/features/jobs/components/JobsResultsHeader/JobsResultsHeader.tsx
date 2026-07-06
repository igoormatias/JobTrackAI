"use client";

import { JobsSortSelect } from "../JobsSortSelect";
import type { JobSortField, SortDirection } from "@/types";

export type JobsResultsHeaderProps = {
  total: number;
  queryMs?: number;
  isLoading?: boolean;
  sort: JobSortField;
  direction: SortDirection;
  onSortChange: (sort: JobSortField) => void;
  onDirectionChange: (direction: SortDirection) => void;
};

export const JobsResultsHeader = ({
  total,
  queryMs,
  isLoading,
  sort,
  direction,
  onSortChange,
  onDirectionChange,
}: JobsResultsHeaderProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm text-muted-foreground">
      {isLoading ? (
        <span className="inline-block h-4 w-48 animate-pulse rounded bg-muted" aria-busy="true" />
      ) : (
        <>
          <span className="font-semibold text-foreground">{total}</span> vagas encontradas
          {queryMs !== undefined ? (
            <span className="text-muted-foreground"> · {queryMs}ms</span>
          ) : null}
        </>
      )}
    </p>
    <JobsSortSelect
      sort={sort}
      direction={direction}
      onSortChange={onSortChange}
      onDirectionChange={onDirectionChange}
    />
  </div>
);
