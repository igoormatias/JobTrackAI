import { X } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export type ChipProps = BadgeProps & {
  onDismiss?: () => void;
};

export const Chip = ({ className, children, onDismiss, ...props }: ChipProps) => (
  <Badge variant="outline" className={cn("gap-1 pr-1", className)} {...props}>
    {children}
    {onDismiss ? (
      <button
        type="button"
        onClick={onDismiss}
        className="cursor-pointer rounded-sm p-0.5 hover:bg-accent"
        aria-label="Remover"
      >
        <X className="h-3 w-3" />
      </button>
    ) : null}
  </Badge>
);
