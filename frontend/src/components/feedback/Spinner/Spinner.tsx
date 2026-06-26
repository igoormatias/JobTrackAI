import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const Spinner = ({ className, size = "md", ...props }: SpinnerProps) => (
  <div
    role="status"
    aria-label="Carregando"
    className={cn(
      "animate-spin rounded-full border-2 border-muted border-t-primary",
      sizeClasses[size],
      className,
    )}
    {...props}
  />
);
