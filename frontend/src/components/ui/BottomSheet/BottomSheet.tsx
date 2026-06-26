"use client";

import { type ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Drawer/Drawer";
import { cn } from "@/lib/utils";

export type BottomSheetProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export const BottomSheet = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: BottomSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" className={cn("pb-safe max-h-[85vh] rounded-t-xl", className)}>
      {title || description ? (
        <SheetHeader>
          {title ? <SheetTitle>{title}</SheetTitle> : null}
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
      ) : null}
      {children}
    </SheetContent>
  </Sheet>
);
