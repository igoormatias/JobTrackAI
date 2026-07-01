"use client";

import type { MatchScore } from "@/types/match";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const labelMap: Record<MatchScore["label"], string> = {
  excellent: "Excelente Match",
  good: "Bom Match",
  fair: "Match Razoável",
  low: "Match Baixo",
};

export type MatchScoreBadgeProps = {
  matchScore: MatchScore;
  className?: string;
};

export const MatchScoreBadge = ({ matchScore, className }: MatchScoreBadgeProps) => (
  <Badge
    variant={matchScore.score >= 85 ? "default" : "secondary"}
    className={cn("font-semibold", className)}
  >
    {matchScore.score}% · {labelMap[matchScore.label]}
  </Badge>
);
