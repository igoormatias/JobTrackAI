import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col items-stretch gap-4 px-4 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
      ) : null}
      <div className="mx-auto w-full min-w-0 max-w-sm space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="text-balance text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mx-auto">{action}</div> : null}
    </div>
  );
};
