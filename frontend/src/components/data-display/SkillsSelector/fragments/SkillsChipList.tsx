"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";

import { Chip } from "@/components/ui/Chip";

import { SortableSkillChip } from "./SortableSkillChip";

export type SkillsChipListProps = {
  skills: string[];
  allSkills: string[];
  enableSortable: boolean;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
  onRemove: (skill: string) => void;
};

export const SkillsChipList = ({
  skills,
  allSkills,
  enableSortable,
  sensors,
  onDragEnd,
  onRemove,
}: SkillsChipListProps) => {
  if (enableSortable) {
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={allSkills} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SortableSkillChip
                key={skill}
                id={skill}
                label={skill}
                sortable={enableSortable}
                onDismiss={() => onRemove(skill)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Chip key={skill} onDismiss={() => onRemove(skill)}>
          {skill}
        </Chip>
      ))}
    </div>
  );
};
