import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type SubtitleProps = HTMLAttributes<HTMLParagraphElement>;

export const Subtitle = ({ className, ...props }: SubtitleProps) => (
  <p className={cn("text-base font-medium text-foreground", className)} {...props} />
);
