"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Drawer";
import type { Application, PipelineStage } from "@/types";

import { PIPELINE_COLUMN_CONFIG } from "../../constants/pipeline-columns";
import { PipelineApplicationCard, type PipelineApplicationCardProps } from "../PipelineApplicationCard";

type PipelineDraggableCardProps = Omit<PipelineApplicationCardProps, "isDragging"> & {
  application: Application;
  onChangeStage?: (applicationId: string, stage: PipelineStage) => void;
};

export const PipelineDraggableCard = ({
  onChangeStage,
  application,
  ...props
}: PipelineDraggableCardProps) => {
  const [stageSheetOpen, setStageSheetOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: { type: "card", application },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const handleStageSelect = (stage: PipelineStage) => {
    if (stage === application.stage) {
      setStageSheetOpen(false);
      return;
    }
    onChangeStage?.(application.id, stage);
    setStageSheetOpen(false);
  };

  return (
    <>
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <PipelineApplicationCard {...props} application={application} isDragging={isDragging} />
        {onChangeStage ? (
          <div className="mt-2 px-1 lg:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(event) => {
                event.stopPropagation();
                setStageSheetOpen(true);
              }}
            >
              Alterar status
            </Button>
          </div>
        ) : null}
      </div>

      <Sheet open={stageSheetOpen} onOpenChange={setStageSheetOpen}>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto lg:hidden">
          <SheetHeader>
            <SheetTitle>Alterar status</SheetTitle>
          </SheetHeader>
          <ul className="mt-4 space-y-1">
            {PIPELINE_COLUMN_CONFIG.map((column) => (
              <li key={column.stage}>
                <button
                  type="button"
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                    application.stage === column.stage ? "bg-primary/10 font-medium text-primary" : "text-foreground"
                  }`}
                  onClick={() => handleStageSelect(column.stage)}
                >
                  {column.label}
                </button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
};
