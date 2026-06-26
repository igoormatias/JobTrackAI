import { type HTMLAttributes } from "react";

import { Spinner } from "@/components/feedback/Spinner";
import { cn } from "@/lib/utils";

export type LoadingProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export const Loading = ({ className, label = "Carregando...", ...props }: LoadingProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center gap-3 py-8", className)}
      {...props}
    >
      <Spinner size="lg" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
};
