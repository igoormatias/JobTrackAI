"use client";

import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

import { JobsFilterFields } from "../JobsFilterFields";
import type { useJobFilters } from "../../hooks/use-job-filters";

export type JobsFilterBarProps = {
  filters: ReturnType<typeof useJobFilters>;
  companies: { id: string; slug: string; name: string }[];
  onOpenAllFilters?: () => void;
  showSalaryFilter?: boolean;
};

export const JobsFilterBar = ({
  filters,
  companies,
  onOpenAllFilters,
  showSalaryFilter = true,
}: JobsFilterBarProps) => {
  const { urlState, setUrlState, hasActiveFilters, clearFilters } = filters;

  return (
    <div className="hidden min-w-0 space-y-3 lg:block">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onOpenAllFilters}>
          <SlidersHorizontal className="mr-1 h-4 w-4" />
          Todos os Filtros
        </Button>
        {hasActiveFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        ) : null}
      </div>
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <JobsFilterFields
          urlState={urlState}
          setUrlState={setUrlState}
          companies={companies}
          showSalaryFilter={showSalaryFilter}
        />
      </div>
      {urlState.areas.length > 0 || urlState.modalities.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {urlState.areas.map((area) => (
            <Chip
              key={area}
              onDismiss={() =>
                void setUrlState({ areas: urlState.areas.filter((item) => item !== area) })
              }
            >
              {area}
            </Chip>
          ))}
          {urlState.modalities.map((modality) => (
            <Chip
              key={modality}
              onDismiss={() =>
                void setUrlState({
                  modalities: urlState.modalities.filter((item) => item !== modality),
                })
              }
            >
              {modality}
            </Chip>
          ))}
        </div>
      ) : null}
    </div>
  );
};
