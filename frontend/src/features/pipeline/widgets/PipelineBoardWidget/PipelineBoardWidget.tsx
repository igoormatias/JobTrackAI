"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { Application, PipelineStage } from "@/types";

import { PipelineColumnNav } from "../../components/PipelineColumnNav";
import { PipelineEmptyState } from "../../components/PipelineEmptyState";
import { PipelineKanbanBoard } from "../../components/PipelineKanbanBoard";
import { PIPELINE_LAYOUT } from "../../constants/pipeline-layout";
import { useMoveApplicationMutation } from "../../hooks/use-move-application-mutation";
import {
  useDeleteApplicationMutation,
  useFavoriteApplicationMutation,
} from "../../hooks/use-pipeline-mutations";
import { usePipelineFilters } from "../../hooks/use-pipeline-filters";
import { usePipelineQuery } from "../../hooks/use-pipeline-query";

export type PipelineBoardWidgetProps = {
  onOpenDetails: (application: Application) => void;
};

export const PipelineBoardWidget = ({ onOpenDetails }: PipelineBoardWidgetProps) => {
  const { listParams } = usePipelineFilters();
  const { data, isLoading } = usePipelineQuery(listParams);
  const moveMutation = useMoveApplicationMutation();
  const favoriteMutation = useFavoriteApplicationMutation();
  const deleteMutation = useDeleteApplicationMutation();
  const [mobileStage, setMobileStage] = useState<PipelineStage>("applied");

  const columnCounts = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(data.columns.map((column) => [column.stage, column.count]));
  }, [data]);

  const handleMove = useCallback(
    (applicationId: string, stage: PipelineStage) => {
      moveMutation.mutate(
        { id: applicationId, stage },
        {
          onSuccess: () => toast.success("Candidatura movida"),
          onError: () => toast.error("Não foi possível mover a candidatura"),
        },
      );
    },
    [moveMutation],
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

  const handleDelete = useCallback(
    (application: Application) => {
      deleteMutation.mutate(application.id, {
        onSuccess: () => toast.success("Candidatura removida"),
        onError: () => toast.error("Não foi possível remover"),
      });
    },
    [deleteMutation],
  );

  const handleScheduleInterview = useCallback((application: Application) => {
    toast.info(`Entrevista agendada (mock) para ${application.job.title}`);
  }, []);

  if (isLoading || !data) return null;

  if (data.totalApplications === 0) {
    return <PipelineEmptyState variant="all" />;
  }

  return (
    <div className={PIPELINE_LAYOUT.page}>
      <PipelineColumnNav
        activeStage={mobileStage}
        counts={columnCounts}
        onChange={setMobileStage}
      />

      <div className="lg:hidden">
        <PipelineKanbanBoard
          columns={data.columns}
          onMove={handleMove}
          onOpenDetails={onOpenDetails}
          onFavorite={handleFavorite}
          onDelete={handleDelete}
          onScheduleInterview={handleScheduleInterview}
          isMovePending={moveMutation.isPending}
          visibleStage={mobileStage}
          mobile
        />
      </div>

      <div className="hidden lg:block">
        <PipelineKanbanBoard
          columns={data.columns}
          onMove={handleMove}
          onOpenDetails={onOpenDetails}
          onFavorite={handleFavorite}
          onDelete={handleDelete}
          onScheduleInterview={handleScheduleInterview}
          isMovePending={moveMutation.isPending}
        />
      </div>
    </div>
  );
};
