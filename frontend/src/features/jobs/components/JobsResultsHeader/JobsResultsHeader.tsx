"use client";

import { JobsSortSelect } from "../JobsSortSelect";
import type { JobSortField, SortDirection } from "@/types";

export type JobsResultsHeaderProps = {
  total: number;
  sort: JobSortField;
  direction: SortDirection;
  onSortChange: (sort: JobSortField) => void;
  onDirectionChange: (direction: SortDirection) => void;
};

export const JobsResultsHeader = ({
  total,
  sort,
  direction,
  onSortChange,
  onDirectionChange,
}: JobsResultsHeaderProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm text-muted-foreground">
      Mostrando <span className="font-semibold text-foreground">{total}</span> vagas encontradas
    </p>
    <JobsSortSelect
      sort={sort}
      direction={direction}
      onSortChange={onSortChange}
      onDirectionChange={onDirectionChange}
    />
  </div>
);
