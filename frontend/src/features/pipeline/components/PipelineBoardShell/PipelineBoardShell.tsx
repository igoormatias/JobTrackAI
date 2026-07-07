"use client";

import { type ReactNode, useRef } from "react";

import { cn } from "@/lib/utils";

import { PIPELINE_LAYOUT } from "../../constants/pipeline-layout";
import { useKanbanAutoScroll } from "../../hooks/use-kanban-auto-scroll";
import { useKanbanBoardNavigation } from "../../hooks/use-kanban-board-navigation";

export type PipelineBoardShellProps = {
  children: ReactNode;
  isDragging?: boolean;
  className?: string;
  hint?: ReactNode;
};

export const PipelineBoardShell = ({
  children,
  isDragging = false,
  className,
  hint,
}: PipelineBoardShellProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useKanbanBoardNavigation(scrollRef);
  useKanbanAutoScroll(scrollRef, isDragging);

  return (
    <div className={cn(PIPELINE_LAYOUT.boardShell, className)}>
      <div className={PIPELINE_LAYOUT.boardViewport}>
        <div
          ref={scrollRef}
          className={cn(PIPELINE_LAYOUT.boardScroll, isDragging && "cursor-grabbing")}
          data-kanban-scroll
          aria-label="Pipeline Kanban"
        >
          {children}
        </div>
      </div>
      {hint}
    </div>
  );
};
