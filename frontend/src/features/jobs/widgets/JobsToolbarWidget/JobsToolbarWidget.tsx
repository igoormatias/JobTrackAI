"use client";

import { JobsFilterBar } from "../../components/JobsFilterBar";
import { JobsFilterSheet } from "../../components/JobsFilterSheet";
import { JobsSearchBar } from "../../components/JobsSearchBar";
import type { useJobFilters } from "../../hooks/use-job-filters";

export type JobsToolbarWidgetProps = {
  filters: ReturnType<typeof useJobFilters>;
  companies: { id: string; name: string }[];
};

export const JobsToolbarWidget = ({ filters, companies }: JobsToolbarWidgetProps) => (
  <div className="space-y-4">
    <JobsSearchBar value={filters.searchInputValue} onChange={filters.setSearchInputValue} />
    <JobsFilterSheet filters={filters} companies={companies} />
    <JobsFilterBar filters={filters} companies={companies} />
  </div>
);
