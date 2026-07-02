"use client";

import { cn } from "@/lib/utils";
import type { PipelineStage } from "@/types";

import { PIPELINE_COLUMN_CONFIG } from "../../constants/pipeline-columns";

export type PipelineColumnNavProps = {
  activeStage: PipelineStage;
  counts: Partial<Record<PipelineStage, number>>;
  onChange: (stage: PipelineStage) => void;
};

export const PipelineColumnNav = ({ activeStage, counts, onChange }: PipelineColumnNavProps) => (
  <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden" role="tablist" aria-label="Colunas do pipeline">
    {PIPELINE_COLUMN_CONFIG.map((column) => (
      <button
        key={column.stage}
        type="button"
        role="tab"
        aria-selected={activeStage === column.stage}
        onClick={() => onChange(column.stage)}
        className={cn(
          "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          activeStage === column.stage
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground",
        )}
      >
        {column.label}
        {counts[column.stage] ? ` (${counts[column.stage]})` : ""}
      </button>
    ))}
  </div>
);
