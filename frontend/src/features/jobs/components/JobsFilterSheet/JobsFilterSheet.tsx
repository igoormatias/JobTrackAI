"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

import { JobsFilterFields } from "../JobsFilterFields";
import type { useJobFilters } from "../../hooks/use-job-filters";

export type JobsFilterSheetProps = {
  filters: ReturnType<typeof useJobFilters>;
  companies: { id: string; slug: string; name: string }[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showSalaryFilter?: boolean;
};

export const JobsFilterSheet = ({
  filters,
  companies,
  open: controlledOpen,
  onOpenChange,
  showSalaryFilter = true,
}: JobsFilterSheetProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const { clearFilters, hasActiveFilters } = filters;

  return (
    <div className="lg:hidden">
      <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filtros
        {hasActiveFilters ? " (ativos)" : ""}
      </Button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Filtros de vagas"
        description="Refine os resultados de acordo com seu perfil."
      >
        <div className="scrollbar-app space-y-4 overflow-y-auto px-1 pb-6">
          <JobsFilterFields
            urlState={filters.urlState}
            setUrlState={filters.setUrlState}
            companies={companies}
            showSalaryFilter={showSalaryFilter}
          />
          <div className="flex gap-2">
            <Button type="button" className="flex-1" onClick={() => setOpen(false)}>
              Aplicar
            </Button>
            <Button type="button" variant="outline" onClick={clearFilters}>
              Limpar
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
