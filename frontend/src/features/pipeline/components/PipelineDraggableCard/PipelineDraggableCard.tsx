"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import { ChangeStageSheet } from "@/features/tracking/components/ChangeStageSheet";
import { cn } from "@/lib/utils";
import type { Application, PipelineStage } from "@/types";

import { PIPELINE_LAYOUT } from "../../constants/pipeline-layout";
import type { PipelineDensity } from "../../hooks/use-pipeline-density";
import { PipelineApplicationCard, type PipelineApplicationCardProps } from "../PipelineApplicationCard";

type PipelineDraggableCardProps = Omit<
  PipelineApplicationCardProps,
  "isDragging" | "onChangeStage" | "dragHandleProps"
> & {
  application: Application;
  onChangeStage?: (applicationId: string, stage: PipelineStage) => void;
  enableDrag?: boolean;
  density?: PipelineDensity;
  isHidden?: boolean;
};

export const PipelineDraggableCard = ({
  onChangeStage,
  application,
  enableDrag = true,
  onEdit,
  density = "default",
  isHidden = false,
  ...props
}: PipelineDraggableCardProps) => {
  const [stageSheetOpen, setStageSheetOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: { type: "card", application, stage: application.stage },
    disabled: !enableDrag,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  const handleStageSelect = (stage: PipelineStage) => {
    if (stage === application.stage) return;
    onChangeStage?.(application.id, stage);
  };

  const handleChangeStageRequest = () => {
    setStageSheetOpen(true);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(PIPELINE_LAYOUT.cardWrapper, isHidden && "invisible")}
      >
        <PipelineApplicationCard
          {...props}
          application={application}
          onEdit={onEdit}
          isDragging={isDragging}
          enableDrag={enableDrag}
          density={density}
          onChangeStage={onChangeStage ? handleChangeStageRequest : undefined}
          dragHandleProps={enableDrag ? { ...listeners, ...attributes } : undefined}
        />
      </div>

      {onChangeStage ? (
        <ChangeStageSheet
          open={stageSheetOpen}
          onOpenChange={setStageSheetOpen}
          currentStage={application.stage}
          onSelectStage={handleStageSelect}
        />
      ) : null}
    </>
  );
};
