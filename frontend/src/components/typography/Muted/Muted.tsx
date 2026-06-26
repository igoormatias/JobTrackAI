import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type MutedProps = HTMLAttributes<HTMLSpanElement>;

export const Muted = ({ className, ...props }: MutedProps) => (
  <span className={cn("text-sm text-muted-foreground", className)} {...props} />
);
