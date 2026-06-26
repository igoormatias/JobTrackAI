import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type TitleProps = HTMLAttributes<HTMLParagraphElement>;

export const Title = ({ className, ...props }: TitleProps) => (
  <p className={cn("text-xl font-semibold text-foreground", className)} {...props} />
);
