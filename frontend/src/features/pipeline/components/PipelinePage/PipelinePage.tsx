"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import type { Application } from "@/types";

import { AddToTrackingModal } from "@/features/tracking/components/AddToTrackingModal/AddToTrackingModal";
import { useCreateTrackingMutation } from "@/features/tracking/hooks/use-tracking-mutations/use-tracking-mutations";

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
  const createTrackingMutation = useCreateTrackingMutation();
  const [selected, setSelected] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline de carreira</h1>
          <p className="text-sm text-muted-foreground">Acompanhe toda a sua jornada de candidaturas</p>
        </div>
        <Button type="button" onClick={() => setManualModalOpen(true)}>
          Adicionar Processo
        </Button>
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

      <AddToTrackingModal
        open={manualModalOpen}
        onOpenChange={setManualModalOpen}
        mode="manual"
        isSubmitting={createTrackingMutation.isPending}
        onSubmit={(values) => {
          createTrackingMutation.mutate(
            values as Parameters<typeof createTrackingMutation.mutate>[0],
            { onSuccess: () => setManualModalOpen(false) },
          );
        }}
      />
    </div>
  );
};
