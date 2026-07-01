"use client";

import type { Application } from "@/types";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Drawer";

import { PipelineDetailContent } from "../PipelineDetailContent";

export type PipelineDetailDrawerProps = {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PipelineDetailDrawer = ({ application, open, onOpenChange }: PipelineDetailDrawerProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto lg:hidden">
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
