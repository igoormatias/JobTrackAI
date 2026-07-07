"use client";

import { useDroppable } from "@dnd-kit/core";
import { memo } from "react";

import { cn } from "@/lib/utils";
import type { Application, PipelineColumn, PipelineStage } from "@/types";

import { PIPELINE_LAYOUT } from "../../constants/pipeline-layout";
import type { PipelineDensity } from "../../hooks/use-pipeline-density";
import { PipelineColumnBody } from "../PipelineVirtualColumn";

export type PipelineKanbanColumnProps = {
  column: PipelineColumn;
  onOpenDetails: (application: Application) => void;
  onEdit?: (application: Application) => void;
  onFavorite: (application: Application) => void;
  onDelete?: (application: Application) => void;
  onChangeStage?: (applicationId: string, stage: PipelineStage) => void;
  activeCardId?: string | null;
  placeholderApplicationId?: string | null;
  className?: string;
  enableDrag?: boolean;
  density?: PipelineDensity;
  isDragging?: boolean;
};

const PipelineKanbanColumnComponent = ({
  column,
  onOpenDetails,
  onEdit,
  onFavorite,
  onDelete,
  onChangeStage,
  activeCardId,
  placeholderApplicationId,
  className,
  enableDrag = true,
  density = "default",
  isDragging = false,
}: PipelineKanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.stage,
    data: { type: "column", stage: column.stage },
    disabled: !enableDrag,
  });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        PIPELINE_LAYOUT.column,
        className,
        isOver && PIPELINE_LAYOUT.columnDropHighlight,
      )}
      aria-label={`Coluna ${column.label}`}
    >
      <header className={PIPELINE_LAYOUT.columnHeader}>
        <h2 className="truncate text-sm font-semibold text-foreground">{column.label}</h2>
        <span className={PIPELINE_LAYOUT.columnCount} aria-label={`${column.count} processos`}>
          {column.count}
        </span>
      </header>

      <PipelineColumnBody
        applications={column.applications}
        onOpenDetails={onOpenDetails}
        onEdit={onEdit}
        onFavorite={onFavorite}
        onDelete={onDelete}
        onChangeStage={onChangeStage}
        activeCardId={activeCardId}
        placeholderApplicationId={placeholderApplicationId}
        enableDrag={enableDrag}
        density={density}
        isDragging={isDragging}
      />
    </section>
  );
};

export const PipelineKanbanColumn = memo(PipelineKanbanColumnComponent);
