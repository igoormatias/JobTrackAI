import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type CaptionProps = HTMLAttributes<HTMLSpanElement>;

export const Caption = ({ className, ...props }: CaptionProps) => (
  <span className={cn("text-xs text-muted-foreground", className)} {...props} />
);
