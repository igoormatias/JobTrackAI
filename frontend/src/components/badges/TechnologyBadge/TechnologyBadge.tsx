import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export type TechnologyBadgeProps = BadgeProps;

export const TechnologyBadge = ({ className, ...props }: TechnologyBadgeProps) => (
  <Badge variant="secondary" className={cn("font-mono text-xs", className)} {...props} />
);
