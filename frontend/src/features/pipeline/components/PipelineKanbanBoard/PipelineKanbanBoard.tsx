"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";

import type { Application, PipelineColumn, PipelineStage } from "@/types";

import { PIPELINE_LAYOUT } from "../../constants/pipeline-layout";
import { PipelineApplicationCard } from "../PipelineApplicationCard";
import { PipelineKanbanColumn } from "../PipelineKanbanColumn";

export type PipelineKanbanBoardProps = {
  columns: PipelineColumn[];
  onMove: (applicationId: string, stage: PipelineStage) => void;
  onOpenDetails: (application: Application) => void;
  onFavorite: (application: Application) => void;
  onDelete: (application: Application) => void;
  onScheduleInterview: (application: Application) => void;
  isMovePending?: boolean;
  visibleStage?: PipelineStage | null;
  mobile?: boolean;
};

export const PipelineKanbanBoard = ({
  columns,
  onMove,
  onOpenDetails,
  onFavorite,
  onDelete,
  onScheduleInterview,
  isMovePending,
  visibleStage,
  mobile,
}: PipelineKanbanBoardProps) => {
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const displayColumns = mobile && visibleStage
    ? columns.filter((column) => column.stage === visibleStage)
    : columns;

  const handleDragStart = (event: DragStartEvent) => {
    const application = columns
      .flatMap((column) => column.applications)
      .find((item) => item.id === event.active.id);
    setActiveApplication(application ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveApplication(null);
    const { active, over } = event;
    if (!over) return;

    const applicationId = String(active.id);
    const overData = over.data.current as { type?: string; stage?: PipelineStage } | undefined;
    const targetStage =
      overData?.type === "column"
        ? overData.stage
        : columns.find((column) => column.applications.some((app) => app.id === over.id))?.stage;

    if (!targetStage) return;

    const current = columns.flatMap((c) => c.applications).find((app) => app.id === applicationId);
    if (!current || current.stage === targetStage) return;

    onMove(applicationId, targetStage);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={mobile ? PIPELINE_LAYOUT.mobileColumn : PIPELINE_LAYOUT.board} aria-live="polite">
        {displayColumns.map((column) => (
          <PipelineKanbanColumn
            key={column.stage}
            column={column}
            onOpenDetails={onOpenDetails}
            onFavorite={onFavorite}
            onDelete={onDelete}
            onScheduleInterview={onScheduleInterview}
            activeCardId={activeApplication?.id}
            className={mobile ? "w-full" : undefined}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApplication ? (
          <PipelineApplicationCard
            application={activeApplication}
            onOpenDetails={onOpenDetails}
            onFavorite={onFavorite}
            onDelete={onDelete}
            onScheduleInterview={onScheduleInterview}
            isDragging
            isPending={isMovePending}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
