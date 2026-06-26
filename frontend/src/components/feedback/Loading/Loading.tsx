import { Loader2 } from "lucide-react";
import { type HTMLAttributes } from "react";

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
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
};
