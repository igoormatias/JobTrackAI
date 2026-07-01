"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { Application } from "@/types";

import { PipelineApplicationCard, type PipelineApplicationCardProps } from "../PipelineApplicationCard";

type PipelineDraggableCardProps = Omit<PipelineApplicationCardProps, "isDragging"> & {
  application: Application;
};

export const PipelineDraggableCard = (props: PipelineDraggableCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.application.id,
    data: { type: "card", application: props.application },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <PipelineApplicationCard {...props} isDragging={isDragging} />
    </div>
  );
};
