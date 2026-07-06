"use client";

import { useState } from "react";

import { JobsFilterBar } from "../../components/JobsFilterBar";
import { JobsFilterSheet } from "../../components/JobsFilterSheet";
import { JobsSearchBar } from "../../components/JobsSearchBar";
import type { useJobFilters } from "../../hooks/use-job-filters";

export type JobsToolbarWidgetProps = {
  filters: ReturnType<typeof useJobFilters>;
  companies: { id: string; slug: string; name: string }[];
  showSalaryFilter?: boolean;
};

export const JobsToolbarWidget = ({
  filters,
  companies,
  showSalaryFilter = true,
}: JobsToolbarWidgetProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="min-w-0 space-y-4">
      <JobsSearchBar value={filters.searchInputValue} onChange={filters.setSearchInputValue} />
      <JobsFilterSheet
        filters={filters}
        companies={companies}
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        showSalaryFilter={showSalaryFilter}
      />
      <JobsFilterBar
        filters={filters}
        companies={companies}
        onOpenAllFilters={() => setFiltersOpen(true)}
        showSalaryFilter={showSalaryFilter}
      />
    </div>
  );
};
