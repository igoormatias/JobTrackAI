"use client";

import { useState } from "react";

import type { MatchScore } from "@/types/match";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";

/** Reason IDs considered "primary" for collapsed mobile view */
const PRIMARY_REASON_IDS = new Set([
  "reason_area",
  "reason_seniority",
  "reason_modality",
]);

const isPrimaryReason = (reason: MatchScore["reasons"][number]): boolean => {
  if (PRIMARY_REASON_IDS.has(reason.id)) return true;
  const label = reason.label.toLowerCase();
  return (
    label.includes("área compatível") ||
    label.includes("senioridade") ||
    label.includes("modalidade")
  );
};

export type MatchReasonsListProps = {
  matchScore: MatchScore;
  className?: string;
  /** Max reasons shown before collapse; 0 = show all */
  maxVisible?: number;
  /** Enable expand/collapse for hidden reasons */
  collapsible?: boolean;
};

export const MatchReasonsList = ({
  matchScore,
  className,
  maxVisible = 0,
  collapsible = false,
}: MatchReasonsListProps) => {
  const [expanded, setExpanded] = useState(false);

  const reasons = matchScore.reasons;
  const shouldCollapse = collapsible && maxVisible > 0 && reasons.length > maxVisible && !expanded;

  const visibleReasons = shouldCollapse
    ? reasons.filter(isPrimaryReason).slice(0, maxVisible)
    : reasons;

  const hiddenCount = shouldCollapse ? reasons.length - visibleReasons.length : 0;

  return (
    <div className={cn("space-y-3", className)}>
      {visibleReasons.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {visibleReasons.map((reason) => (
            <Chip
              key={reason.id}
              className={cn(!reason.matched && "border-destructive/40 text-destructive")}
            >
              {reason.matched ? "✔" : "✖"} {reason.label}
            </Chip>
          ))}
          {hiddenCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => setExpanded(true)}
              data-testid="match-reasons-expand"
            >
              +{hiddenCount} critério{hiddenCount > 1 ? "s" : ""}
            </Button>
          ) : null}
          {expanded && collapsible && reasons.length > maxVisible ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => setExpanded(false)}
              data-testid="match-reasons-collapse"
            >
              Mostrar menos
            </Button>
          ) : null}
        </div>
      ) : null}

      {matchScore.missingSkills.length > 0 && (!shouldCollapse || expanded) ? (
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
};
