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
        "flex w-full min-w-[min(100%,20rem)] flex-col items-stretch gap-4 px-4 py-12 text-center sm:items-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
      ) : null}
      <div className="mx-auto w-full min-w-[min(100%,18rem)] max-w-md space-y-2">
        <h3 className="break-words text-lg font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="break-words text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mx-auto flex w-full max-w-md flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
};
