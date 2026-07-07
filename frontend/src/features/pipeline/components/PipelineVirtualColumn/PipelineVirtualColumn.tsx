"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { type RefObject, useRef } from "react";

import type { Application } from "@/types";

import { PIPELINE_LAYOUT } from "../../constants/pipeline-layout";
import type { PipelineDensity } from "../../hooks/use-pipeline-density";
import { PipelineDraggableCard } from "../PipelineDraggableCard";
import type { PipelineKanbanColumnProps } from "../PipelineKanbanColumn/PipelineKanbanColumn";

const VIRTUALIZATION_THRESHOLD = 25;

type PipelineVirtualColumnBodyProps = Pick<
  PipelineKanbanColumnProps,
  | "onOpenDetails"
  | "onEdit"
  | "onFavorite"
  | "onDelete"
  | "onChangeStage"
  | "activeCardId"
  | "enableDrag"
  | "density"
  | "isDragging"
  | "placeholderApplicationId"
> & {
  applications: Application[];
  scrollRef: RefObject<HTMLDivElement | null>;
};

export const PipelineVirtualColumnBody = ({
  applications,
  scrollRef,
  onOpenDetails,
  onEdit,
  onFavorite,
  onDelete,
  onChangeStage,
  activeCardId,
  enableDrag = true,
  density = "default",
  isDragging = false,
  placeholderApplicationId,
}: PipelineVirtualColumnBodyProps) => {
  const shouldVirtualize = applications.length > VIRTUALIZATION_THRESHOLD && !isDragging;

  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? applications.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (density === "compact" ? 96 : 128),
    overscan: 4,
  });

  if (applications.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
        {enableDrag ? "Arraste candidaturas para cá" : "Nenhum processo neste status"}
      </p>
    );
  }

  if (!shouldVirtualize) {
    return (
      <>
        {applications.map((application) => (
          <div key={application.id} className={PIPELINE_LAYOUT.cardWrapper}>
            {placeholderApplicationId === application.id ? (
              <div
                className="mb-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5"
                style={{ minHeight: density === "compact" ? 96 : 128 }}
                aria-hidden
              />
            ) : null}
            <PipelineDraggableCard
              application={application}
              onOpenDetails={onOpenDetails}
              onEdit={onEdit}
              onFavorite={onFavorite}
              onDelete={onDelete}
              onChangeStage={onChangeStage}
              isPending={activeCardId === application.id}
              enableDrag={enableDrag}
              density={density}
              isHidden={placeholderApplicationId === application.id}
            />
          </div>
        ))}
      </>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      style={{
        height: virtualizer.getTotalSize(),
        width: "100%",
        position: "relative",
      }}
    >
      {virtualItems.map((virtualItem) => {
        const application = applications[virtualItem.index]!;
        return (
          <div
            key={application.id}
            className={PIPELINE_LAYOUT.cardWrapper}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {placeholderApplicationId === application.id ? (
              <div
                className="mb-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5"
                style={{ minHeight: density === "compact" ? 96 : 128 }}
                aria-hidden
              />
            ) : null}
            <PipelineDraggableCard
              application={application}
              onOpenDetails={onOpenDetails}
              onEdit={onEdit}
              onFavorite={onFavorite}
              onDelete={onDelete}
              onChangeStage={onChangeStage}
              isPending={activeCardId === application.id}
              enableDrag={enableDrag}
              density={density}
              isHidden={placeholderApplicationId === application.id}
            />
          </div>
        );
      })}
    </div>
  );
};

export const PipelineColumnBody = ({
  applications,
  ...props
}: Omit<PipelineVirtualColumnBodyProps, "scrollRef">) => {
  const parentRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={parentRef} data-kanban-column-body className={PIPELINE_LAYOUT.columnBody}>
      <PipelineVirtualColumnBody applications={applications} scrollRef={parentRef} {...props} />
    </div>
  );
};
