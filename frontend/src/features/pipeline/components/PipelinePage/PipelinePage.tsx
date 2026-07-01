"use client";

import { useState } from "react";

import type { Application } from "@/types";

import { PipelineBoardSkeleton } from "../../components/PipelineBoardSkeleton";
import { PipelineDetailDrawer } from "../../components/PipelineDetailDrawer";
import { PipelineDetailPanel } from "../../components/PipelineDetailPanel";
import { PipelineEmptyState } from "../../components/PipelineEmptyState";
import { PIPELINE_LAYOUT } from "../../constants/pipeline-layout";
import { usePipelineFilters } from "../../hooks/use-pipeline-filters";
import { usePipelineQuery } from "../../hooks/use-pipeline-query";
import { PipelineBoardWidget } from "../../widgets/PipelineBoardWidget";
import { PipelineKpisWidget } from "../../widgets/PipelineKpisWidget";
import { PipelineToolbarWidget } from "../../widgets/PipelineToolbarWidget";

export const PipelinePage = () => {
  const { listParams } = usePipelineFilters();
  const { data, isLoading, isError } = usePipelineQuery(listParams);
  const [selected, setSelected] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetails = (application: Application) => {
    setSelected(application);
    setDetailOpen(true);
  };

  if (isLoading) return <PipelineBoardSkeleton />;

  if (isError) {
    return (
      <PipelineEmptyState variant="all" />
    );
  }

  return (
    <div className={PIPELINE_LAYOUT.page}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pipeline de carreira</h1>
        <p className="text-sm text-muted-foreground">Acompanhe toda a sua jornada de candidaturas</p>
      </div>

      {data ? <PipelineKpisWidget kpis={data.kpis} /> : null}
      <PipelineToolbarWidget />
      <PipelineBoardWidget onOpenDetails={openDetails} />

      <PipelineDetailDrawer
        application={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <PipelineDetailPanel
        application={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
};
