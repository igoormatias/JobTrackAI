import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type BodyProps = HTMLAttributes<HTMLParagraphElement>;

export const Body = ({ className, ...props }: BodyProps) => (
  <p className={cn("text-sm text-foreground", className)} {...props} />
);
