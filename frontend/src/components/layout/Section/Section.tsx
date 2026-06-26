import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type SectionProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  description?: string;
};

export const Section = ({ title, description, className, children, ...props }: SectionProps) => {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      {title || description ? (
        <div className="space-y-1">
          {title ? <h2 className="text-lg font-semibold text-foreground">{title}</h2> : null}
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
};
