"use client";

import type { MatchScore } from "@/types/match";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";

export type MatchBreakdownCardProps = {
  matchScore: MatchScore;
  className?: string;
};

export const MatchBreakdownCard = ({ matchScore, className }: MatchBreakdownCardProps) => {
  const skillEvidence = matchScore.skillEvidence ?? [];
  const factors = (matchScore.factors ?? []).filter((factor) => factor.applicable);
  const coverage = matchScore.skillCoverage;

  if (skillEvidence.length === 0 && factors.length === 0) {
    return null;
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base">Como calculamos este Match</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {coverage ? (
          <p className="text-sm text-muted-foreground">
            Cobertura de skills: {coverage.matched} de {coverage.required} · {coverage.percent}%
          </p>
        ) : null}

        {skillEvidence.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Skills exigidas</p>
            <div className="flex flex-wrap gap-2">
              {skillEvidence.map((item) => (
                <Chip
                  key={item.slug}
                  className={cn(!item.present && "border-destructive/40 text-destructive")}
                >
                  {item.present ? "✔" : "✖"} {item.name}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}

        {factors.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Fatores</p>
            <div className="flex flex-wrap gap-2">
              {factors.map((factor) => (
                <Chip
                  key={factor.id}
                  className={cn(!factor.matched && "border-destructive/40 text-destructive")}
                >
                  {factor.matched ? "✔" : "✖"} {factor.label} ({factor.weight}%)
                </Chip>
              ))}
            </div>
          </div>
        ) : null}

        {matchScore.engineVersion ? (
          <p className="text-xs text-muted-foreground">Engine {matchScore.engineVersion}</p>
        ) : null}
      </CardContent>
    </Card>
  );
};
