"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Link2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { Application, PipelineData } from "@/types";

import { ImportJobByUrlModal } from "@/features/job-import/components/ImportJobByUrlModal/ImportJobByUrlModal";
import { AddToTrackingModal } from "@/features/tracking/components/AddToTrackingModal/AddToTrackingModal";
import { useCreateTrackingMutation } from "@/features/tracking/hooks/use-tracking-mutations/use-tracking-mutations";

import { PipelineBoardSkeleton } from "../../components/PipelineBoardSkeleton";
import { PIPELINE_LAYOUT } from "../../constants/pipeline-layout";
import { usePipelineFilters } from "../../hooks/use-pipeline-filters";
import { usePipelineQuery } from "../../hooks/use-pipeline-query";
import { PipelineBoardWidget } from "../../widgets/PipelineBoardWidget";
import { PipelineKpisWidget } from "../../widgets/PipelineKpisWidget";
import { PipelineToolbarWidget } from "../../widgets/PipelineToolbarWidget";

export const PipelinePage = () => {
  const router = useRouter();
  const { listParams } = usePipelineFilters();
  const { data, isLoading, isError, refetch } = usePipelineQuery(listParams);
  const createTrackingMutation = useCreateTrackingMutation();
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const openDetails = (application: Application) => {
    router.push(`/pipeline/${application.id}`);
  };

  const openEdit = (application: Application) => {
    router.push(`/pipeline/${application.id}?edit=1`);
  };

  if (isLoading) return <PipelineBoardSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Não foi possível carregar o pipeline"
        description="Verifique sua conexão e tente novamente."
        action={
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  return (
    <div className={PIPELINE_LAYOUT.page}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline de carreira</h1>
          <p className="text-sm text-muted-foreground">Acompanhe toda a sua jornada de candidaturas</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => setImportModalOpen(true)}>
            <Link2 className="size-4" aria-hidden />
            Importar por URL
          </Button>
          <Button type="button" onClick={() => setManualModalOpen(true)}>
            Adicionar Processo
          </Button>
        </div>
      </div>

      {data ? <PipelineKpisWidget kpis={data.kpis} /> : null}
      <PipelineToolbarWidget />
      <PipelineBoardWidget
        data={data as PipelineData}
        onOpenDetails={openDetails}
        onEdit={openEdit}
        suppressEmptyState={manualModalOpen}
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

      <ImportJobByUrlModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        defaultAddToPipeline
      />
    </div>
  );
};
