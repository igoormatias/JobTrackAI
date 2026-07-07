"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { Application, PipelineData, PipelineStage } from "@/types";

import { StageDateConfirmDialog } from "@/features/tracking/components/StageDateConfirmDialog/StageDateConfirmDialog";
import { DeleteProcessDialog } from "@/features/tracking/components/DeleteProcessDialog";
import { useMoveTrackingStageMutation } from "@/features/tracking/hooks/use-tracking-mutations/use-tracking-mutations";

import { PipelineBoardSkeleton } from "../../components/PipelineBoardSkeleton";
import { PipelineColumnNav } from "../../components/PipelineColumnNav";
import { PipelineEmptyState } from "../../components/PipelineEmptyState";
import { PipelineKanbanBoard } from "../../components/PipelineKanbanBoard";
import { usePipelineDensity } from "../../hooks/use-pipeline-density";
import {
  useDeleteApplicationMutation,
  useFavoriteApplicationMutation,
} from "../../hooks/use-pipeline-mutations";
import { usePipelineFilters } from "../../hooks/use-pipeline-filters";
import { usePipelineQuery } from "../../hooks/use-pipeline-query";

export type PipelineBoardWidgetProps = {
  onOpenDetails: (application: Application) => void;
  onEdit?: (application: Application) => void;
  suppressEmptyState?: boolean;
  data?: PipelineData;
};

export const PipelineBoardWidget = ({
  onOpenDetails,
  onEdit,
  suppressEmptyState = false,
  data: dataProp,
}: PipelineBoardWidgetProps) => {
  const { listParams } = usePipelineFilters();
  const { density } = usePipelineDensity();
  const { data: queryData, isLoading: isQueryLoading } = usePipelineQuery(listParams, {
    enabled: dataProp === undefined,
  });
  const data = dataProp ?? queryData;
  const isLoading = dataProp === undefined && isQueryLoading;
  const moveMutation = useMoveTrackingStageMutation();
  const favoriteMutation = useFavoriteApplicationMutation();
  const deleteMutation = useDeleteApplicationMutation();
  const [mobileStage, setMobileStage] = useState<PipelineStage>("applied");
  const [pendingMove, setPendingMove] = useState<{ id: string; stage: PipelineStage } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

  const columnCounts = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(data.columns.map((column) => [column.stage, column.count]));
  }, [data]);

  const handleMove = useCallback((applicationId: string, stage: PipelineStage) => {
    setPendingMove({ id: applicationId, stage });
  }, []);

  const confirmMove = useCallback(
    (occurredAt: string) => {
      if (!pendingMove) return;
      moveMutation.mutate(
        { id: pendingMove.id, stage: pendingMove.stage, occurredAt },
        {
          onSuccess: () => toast.success("Status atualizado"),
          onError: () => toast.error("Não foi possível mover a candidatura"),
          onSettled: () => setPendingMove(null),
        },
      );
    },
    [moveMutation, pendingMove],
  );

  const handleFavorite = useCallback(
    (application: Application) => {
      favoriteMutation.mutate(application.id, {
        onSuccess: () => toast.success("Favorito atualizado"),
        onError: () => toast.error("Não foi possível favoritar"),
      });
    },
    [favoriteMutation],
  );

  const handleDeleteRequest = useCallback((application: Application) => {
    setDeleteTarget(application);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Processo excluído");
        setDeleteTarget(null);
      },
      onError: () => toast.error("Não foi possível excluir o processo"),
    });
  }, [deleteMutation, deleteTarget]);

  const visibleMobileCount = columnCounts[mobileStage] ?? 0;
  const showMobileStageHint = data != null && data.totalApplications > visibleMobileCount;

  if (isLoading || !data) return <PipelineBoardSkeleton />;

  if (data.totalApplications === 0) {
    if (suppressEmptyState) return null;
    return <PipelineEmptyState variant="all" />;
  }

  const boardProps = {
    columns: data.columns,
    onMove: handleMove,
    onOpenDetails,
    onEdit,
    onFavorite: handleFavorite,
    onDelete: handleDeleteRequest,
    isMovePending: moveMutation.isPending,
    density,
  };

  return (
    <>
      <div className="lg:hidden">
        <PipelineColumnNav
          activeStage={mobileStage}
          counts={columnCounts}
          onChange={setMobileStage}
        />

        {showMobileStageHint ? (
          <p className="px-3 text-sm text-muted-foreground">
            Exibindo {visibleMobileCount} de {data.totalApplications} processos nesta etapa. Use as abas acima
            para ver os demais.
          </p>
        ) : null}

        <PipelineKanbanBoard {...boardProps} visibleStage={mobileStage} mobile />
      </div>

      <div className="hidden min-h-0 flex-1 lg:flex">
        <PipelineKanbanBoard {...boardProps} />
      </div>

      <DeleteProcessDialog
        application={deleteTarget}
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />

      <StageDateConfirmDialog
        open={Boolean(pendingMove)}
        onOpenChange={(open) => {
          if (!open) setPendingMove(null);
        }}
        onConfirm={confirmMove}
        isPending={moveMutation.isPending}
      />
    </>
  );
};
