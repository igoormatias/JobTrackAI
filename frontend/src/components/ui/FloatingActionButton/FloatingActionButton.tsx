"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type FloatingActionButtonProps = {
  onClick?: () => void;
  label?: string;
  className?: string;
};

export const FloatingActionButton = ({
  onClick,
  label = "Nova ação",
  className,
}: FloatingActionButtonProps) => (
  <Button
    size="icon"
    className={cn(
      "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg lg:hidden",
      className,
    )}
    onClick={onClick}
    aria-label={label}
  >
    <Plus className="h-6 w-6" />
  </Button>
);
