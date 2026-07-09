"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";

export type SortableSkillChipProps = {
  id: string;
  label: string;
  onDismiss: () => void;
  sortable: boolean;
};

export const SortableSkillChip = ({ id, label, onDismiss, sortable }: SortableSkillChipProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("flex items-center", isDragging && "z-10 opacity-80")}>
      {sortable ? (
        <button
          type="button"
          className="mr-0.5 cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label={`Reordenar ${label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
        </button>
      ) : null}
      <Chip onDismiss={onDismiss}>{label}</Chip>
    </div>
  );
};
