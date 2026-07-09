"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useCallback, useState } from "react";

import type { Application, PipelineColumn, PipelineStage } from "@/types";

import { cn } from "@/lib/utils";

import { PIPELINE_COLUMN_WIDTH, PIPELINE_LAYOUT } from "../../constants/pipeline-layout";
import type { PipelineDensity } from "../../hooks/use-pipeline-density";
import { PipelineBoardShell } from "../PipelineBoardShell";
import { PipelineApplicationCard } from "../PipelineApplicationCard";
import { PipelineKanbanColumn } from "../PipelineKanbanColumn";

export type PipelineKanbanBoardProps = {
  columns: PipelineColumn[];
  onMove: (applicationId: string, stage: PipelineStage) => void;
  onOpenDetails: (application: Application) => void;
  onEdit?: (application: Application) => void;
  onFavorite: (application: Application) => void;
  onDelete?: (application: Application) => void;
  isMovePending?: boolean;
  visibleStage?: PipelineStage | null;
  mobile?: boolean;
  density?: PipelineDensity;
};

const columnCollision: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args).filter((collision) => {
    const data = collision.data?.droppableContainer?.data?.current as { type?: string } | undefined;
    return data?.type === "column";
  });

  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCenter(args);
};

export const PipelineKanbanBoard = ({
  columns,
  onMove,
  onOpenDetails,
  onEdit,
  onFavorite,
  onDelete,
  isMovePending,
  visibleStage,
  mobile,
  density = "default",
}: PipelineKanbanBoardProps) => {
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  const enableDrag = !mobile;
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

  const handleDragOver = (_event: DragOverEvent) => {
    // Column highlight handled by useDroppable isOver per column
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

  const handleDragCancel = useCallback(() => {
    setActiveApplication(null);
  }, []);

  const columnNodes = displayColumns.map((column) => (
    <PipelineKanbanColumn
      key={column.stage}
      column={column}
      onOpenDetails={onOpenDetails}
      onEdit={onEdit}
      onFavorite={onFavorite}
      onDelete={onDelete}
      onChangeStage={mobile ? onMove : undefined}
      activeCardId={activeApplication?.id}
      placeholderApplicationId={activeApplication?.id ?? null}
      className={mobile ? "w-full border-0 bg-transparent" : undefined}
      enableDrag={enableDrag}
      density={density}
      isDragging={Boolean(activeApplication)}
    />
  ));

  const boardHint = (
    <p className={cn(PIPELINE_LAYOUT.boardHint, mobile ? "px-1" : "hidden lg:block")}>
      Shift + rolagem, botão central do mouse ou arraste na área vazia para navegar horizontalmente.
    </p>
  );

  if (!enableDrag) {
    return (
      <div className={PIPELINE_LAYOUT.mobileColumn} aria-live="polite">
        {columnNodes}
        {boardHint}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={columnCollision}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <PipelineBoardShell isDragging={Boolean(activeApplication)} hint={boardHint}>
        {columnNodes}
      </PipelineBoardShell>

      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1)" }}>
        {activeApplication ? (
          <div
            className="rotate-1 opacity-95 shadow-2xl ring-2 ring-primary/40"
            style={{ width: PIPELINE_COLUMN_WIDTH }}
          >
            <PipelineApplicationCard
              application={activeApplication}
              onOpenDetails={onOpenDetails}
              onEdit={onEdit}
              onFavorite={onFavorite}
              onDelete={onDelete}
              isDragging
              isPending={isMovePending}
              density={density}
              enableDrag
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
