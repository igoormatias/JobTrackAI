"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { memo } from "react";

import { cn } from "@/lib/utils";
import type { Application, PipelineColumn, PipelineStage } from "@/types";

import { PIPELINE_LAYOUT } from "../../constants/pipeline-layout";
import { PipelineDraggableCard } from "../PipelineDraggableCard";

export type PipelineKanbanColumnProps = {
  column: PipelineColumn;
  onOpenDetails: (application: Application) => void;
  onEdit?: (application: Application) => void;
  onFavorite: (application: Application) => void;
  onDelete?: (application: Application) => void;
  onChangeStage?: (applicationId: string, stage: PipelineStage) => void;
  activeCardId?: string | null;
  className?: string;
  enableDrag?: boolean;
};

const PipelineKanbanColumnComponent = ({
  column,
  onOpenDetails,
  onEdit,
  onFavorite,
  onDelete,
  onChangeStage,
  activeCardId,
  className,
  enableDrag = true,
}: PipelineKanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.stage,
    data: { type: "column", stage: column.stage },
    disabled: !enableDrag,
  });

  return (
    <section
      ref={setNodeRef}
      className={cn(PIPELINE_LAYOUT.column, className, isOver && "ring-2 ring-primary/30 rounded-lg")}
      aria-label={`Coluna ${column.label}`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{column.label}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{column.count}</span>
      </header>

      <SortableContext
        items={column.applications.map((app) => app.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {column.applications.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
              {enableDrag ? "Arraste candidaturas para cá" : "Nenhum processo neste status"}
            </p>
          ) : (
            column.applications.map((application) => (
              <PipelineDraggableCard
                key={application.id}
                application={application}
                onOpenDetails={onOpenDetails}
                onEdit={onEdit}
                onFavorite={onFavorite}
                onDelete={onDelete}
                onChangeStage={onChangeStage}
                isPending={activeCardId === application.id}
                enableDrag={enableDrag}
              />
            ))
          )}
        </div>
      </SortableContext>
    </section>
  );
};

export const PipelineKanbanColumn = memo(PipelineKanbanColumnComponent);
