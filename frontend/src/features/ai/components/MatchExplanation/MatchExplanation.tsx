import { Badge } from "@/components/ui/Badge";

export type MatchExplanationProps = {
  matchExplanation: string;
  matchScore?: number;
  matchEngineVersion?: string;
};

export const MatchExplanation = ({
  matchExplanation,
  matchScore,
  matchEngineVersion,
}: MatchExplanationProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <h4 className="text-sm font-semibold text-foreground">Match explicado</h4>
      {matchScore !== undefined ? (
        <Badge variant="secondary" className="text-xs">
          {matchScore}%{matchEngineVersion ? ` · ${matchEngineVersion}` : ""}
        </Badge>
      ) : null}
    </div>
    <p className="text-sm text-muted-foreground">{matchExplanation}</p>
  </div>
);
