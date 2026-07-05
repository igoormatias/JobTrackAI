"use client";

import type { Application } from "@/types";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Drawer";
import { useIsDesktop } from "@/hooks/use-breakpoint/use-breakpoint";

import { PipelineDetailContent } from "../PipelineDetailContent";

export type PipelineDetailSheetProps = {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PipelineDetailSheet = ({ application, open, onOpenChange }: PipelineDetailSheetProps) => {
  const isDesktop = useIsDesktop();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={
          isDesktop
            ? "h-full w-full max-w-xl overflow-y-auto"
            : "max-h-[85vh] overflow-y-auto rounded-t-xl"
        }
      >
        {application ? (
          <>
            <SheetHeader>
              <SheetTitle>Detalhes do processo</SheetTitle>
            </SheetHeader>
            <PipelineDetailContent application={application} />
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};
