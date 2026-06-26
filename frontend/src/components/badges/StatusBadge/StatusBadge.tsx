import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export type StatusBadgeVariant =
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "favorite"
  | "default";

const statusStyles: Record<StatusBadgeVariant, string> = {
  applied: "bg-info/20 text-info border-info/30",
  interview: "bg-warning/20 text-warning border-warning/30",
  offer: "bg-success/20 text-success border-success/30",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
  favorite: "bg-primary/20 text-primary border-primary/30",
  default: "",
};

export type StatusBadgeProps = BadgeProps & {
  status?: StatusBadgeVariant;
};

export const StatusBadge = ({
  status = "default",
  className,
  ...props
}: StatusBadgeProps) => (
  <Badge variant="outline" className={cn(statusStyles[status], className)} {...props} />
);
