"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-client/query-keys";

import type { Application, PipelineStage } from "@/types";

import { StageDateConfirmDialog } from "@/features/tracking/components/StageDateConfirmDialog/StageDateConfirmDialog";
import { ScheduleInterviewDialog } from "@/features/tracking/components/ScheduleInterviewDialog";
import { createInterview } from "@/features/tracking/services/tracking-service";
import { useMoveTrackingStageMutation } from "@/features/tracking/hooks/use-tracking-mutations/use-tracking-mutations";

import { PipelineColumnNav } from "../../components/PipelineColumnNav";
import { PipelineEmptyState } from "../../components/PipelineEmptyState";
import { PipelineKanbanBoard } from "../../components/PipelineKanbanBoard";
import { PIPELINE_LAYOUT } from "../../constants/pipeline-layout";
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
  const moveMutation = useMoveTrackingStageMutation();
  const favoriteMutation = useFavoriteApplicationMutation();
  const deleteMutation = useDeleteApplicationMutation();
  const [mobileStage, setMobileStage] = useState<PipelineStage>("applied");
  const [pendingMove, setPendingMove] = useState<{ id: string; stage: PipelineStage } | null>(null);
  const [interviewApplication, setInterviewApplication] = useState<Application | null>(null);
  const queryClient = useQueryClient();

  const scheduleInterviewMutation = useMutation({
    mutationFn: ({
      trackingId,
      scheduledAt,
      link,
      notes,
    }: {
      trackingId: string;
      scheduledAt: string;
      link?: string | null;
      notes?: string | null;
    }) => createInterview(trackingId, { scheduledAt, link, notes }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tracking.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("Entrevista agendada");
      setInterviewApplication(null);
    },
    onError: () => toast.error("Não foi possível agendar a entrevista"),
  });

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
    setInterviewApplication(application);
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

      <StageDateConfirmDialog
        open={Boolean(pendingMove)}
        onOpenChange={(open) => {
          if (!open) setPendingMove(null);
        }}
        onConfirm={confirmMove}
        isPending={moveMutation.isPending}
      />

      <ScheduleInterviewDialog
        open={Boolean(interviewApplication)}
        onOpenChange={(open) => {
          if (!open) setInterviewApplication(null);
        }}
        application={interviewApplication}
        isPending={scheduleInterviewMutation.isPending}
        onSubmit={(values) => {
          if (!interviewApplication) return;
          scheduleInterviewMutation.mutate({
            trackingId: interviewApplication.id,
            ...values,
          });
        }}
      />
    </div>
  );
};
