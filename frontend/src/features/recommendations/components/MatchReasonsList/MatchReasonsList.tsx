import type { MatchScore } from "@/types/match";

import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";

export type MatchReasonsListProps = {
  matchScore: MatchScore;
  className?: string;
};

export const MatchReasonsList = ({ matchScore, className }: MatchReasonsListProps) => (
  <div className={cn("space-y-3", className)}>
    {matchScore.reasons.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {matchScore.reasons.map((reason) => (
          <Chip
            key={reason.id}
            className={cn(!reason.matched && "border-destructive/40 text-destructive")}
          >
            {reason.matched ? "✔" : "✖"} {reason.label}
          </Chip>
        ))}
      </div>
    ) : null}

    {matchScore.missingSkills.length > 0 ? (
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Skills em falta</p>
        <div className="flex flex-wrap gap-2">
          {matchScore.missingSkills.map((skill) => (
            <Chip key={skill.id}>{skill.name}</Chip>
          ))}
        </div>
      </div>
    ) : null}
  </div>
);
