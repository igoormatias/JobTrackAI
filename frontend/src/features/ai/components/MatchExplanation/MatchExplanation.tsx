import { Badge } from "@/components/ui/Badge";

export type MatchExplanationProps = {
  matchExplanation: string;
  matchScore?: number;
};

export const MatchExplanation = ({ matchExplanation, matchScore }: MatchExplanationProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <h4 className="text-sm font-semibold text-foreground">Match explicado</h4>
      {matchScore !== undefined ? (
        <Badge variant="secondary" className="text-xs">
          {matchScore}% · rules-v1
        </Badge>
      ) : null}
    </div>
    <p className="text-sm text-muted-foreground">{matchExplanation}</p>
  </div>
);
