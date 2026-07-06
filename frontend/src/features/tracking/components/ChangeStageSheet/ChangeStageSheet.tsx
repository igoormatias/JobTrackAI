"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Drawer";
import { PIPELINE_COLUMN_CONFIG } from "@/features/pipeline/constants/pipeline-columns";
import type { PipelineStage } from "@/types";

export type ChangeStageSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStage: PipelineStage;
  onSelectStage: (stage: PipelineStage) => void;
  title?: string;
};

export const ChangeStageSheet = ({
  open,
  onOpenChange,
  currentStage,
  onSelectStage,
  title = "Alterar status",
}: ChangeStageSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
      </SheetHeader>
      <ul className="mt-4 space-y-1">
        {PIPELINE_COLUMN_CONFIG.map((column) => (
          <li key={column.stage}>
            <button
              type="button"
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                currentStage === column.stage ? "bg-primary/10 font-medium text-primary" : "text-foreground"
              }`}
              onClick={() => {
                onSelectStage(column.stage);
                onOpenChange(false);
              }}
            >
              {column.label}
            </button>
          </li>
        ))}
      </ul>
    </SheetContent>
  </Sheet>
);
