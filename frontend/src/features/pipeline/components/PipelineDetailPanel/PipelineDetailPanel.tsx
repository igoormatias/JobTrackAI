"use client";

import type { Application } from "@/types";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Drawer";

import { PipelineDetailContent } from "../PipelineDetailContent";

export type PipelineDetailPanelProps = {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PipelineDetailPanel = ({ application, open, onOpenChange }: PipelineDetailPanelProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="hidden w-full max-w-xl overflow-y-auto lg:block">
      {application ? (
        <>
          <SheetHeader>
            <SheetTitle>Detalhes da candidatura</SheetTitle>
          </SheetHeader>
          <PipelineDetailContent application={application} />
        </>
      ) : null}
    </SheetContent>
  </Sheet>
);
