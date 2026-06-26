import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export type MatchBadgeProps = BadgeProps & {
  score: number;
};

const getMatchVariant = (score: number): string => {
  if (score >= 80) return "bg-success/20 text-success border-success/30";
  if (score >= 50) return "bg-warning/20 text-warning border-warning/30";
  return "bg-muted text-muted-foreground border-border";
};

export const MatchBadge = ({ score, className, ...props }: MatchBadgeProps) => (
  <Badge variant="outline" className={cn(getMatchVariant(score), className)} {...props}>
    {score}% Match
  </Badge>
);
