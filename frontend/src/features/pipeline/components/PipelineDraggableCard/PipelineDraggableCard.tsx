"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import { ChangeStageSheet } from "@/features/tracking/components/ChangeStageSheet";
import type { Application, PipelineStage } from "@/types";

import { PipelineApplicationCard, type PipelineApplicationCardProps } from "../PipelineApplicationCard";

type PipelineDraggableCardProps = Omit<PipelineApplicationCardProps, "isDragging" | "onChangeStage"> & {
  application: Application;
  onChangeStage?: (applicationId: string, stage: PipelineStage) => void;
  enableDrag?: boolean;
};

export const PipelineDraggableCard = ({
  onChangeStage,
  application,
  enableDrag = true,
  onEdit,
  ...props
}: PipelineDraggableCardProps) => {
  const [stageSheetOpen, setStageSheetOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: { type: "card", application },
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
        {...(enableDrag ? listeners : {})}
        {...(enableDrag ? attributes : {})}
      >
        <PipelineApplicationCard
          {...props}
          application={application}
          onEdit={onEdit}
          isDragging={isDragging}
          enableDrag={enableDrag}
          onChangeStage={onChangeStage ? handleChangeStageRequest : undefined}
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
