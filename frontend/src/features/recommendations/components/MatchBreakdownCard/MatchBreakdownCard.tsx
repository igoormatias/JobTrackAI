"use client";

import type { MatchScore } from "@/types/match";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";

export type MatchBreakdownCardProps = {
  matchScore: MatchScore;
  className?: string;
};

const CONFIDENCE_LABEL: Record<"high" | "medium" | "low", string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export const MatchBreakdownCard = ({ matchScore, className }: MatchBreakdownCardProps) => {
  const skillEvidence = matchScore.skillEvidence ?? [];
  const factors = (matchScore.factors ?? []).filter((factor) => factor.applicable);
  const coverage = matchScore.skillCoverage;
  const confidence = matchScore.confidence;
  const foundSkills = skillEvidence.filter((item) => item.present);
  const missingSkills = skillEvidence.filter((item) => !item.present);
  const hasCoverage = Boolean(coverage && coverage.required > 0);

  if (skillEvidence.length === 0 && factors.length === 0 && !confidence) {
    return null;
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base">Como calculamos este Match</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasCoverage ? (
          <p className="text-sm text-muted-foreground">
            Cobertura: {coverage!.matched} de {coverage!.required} · {coverage!.percent}%
          </p>
        ) : null}

        {foundSkills.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Skills encontradas</p>
            <div className="flex flex-wrap gap-2">
              {foundSkills.map((item) => (
                <Chip key={item.slug}>✔ {item.name}</Chip>
              ))}
            </div>
          </div>
        ) : null}

        {missingSkills.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Não encontradas</p>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((item) => (
                <Chip key={item.slug} className="border-destructive/40 text-destructive">
                  ✖ {item.name}
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

        {confidence ? (
          <p className="text-sm text-muted-foreground">
            Confiança {CONFIDENCE_LABEL[confidence.level]} ({confidence.score}%)
            {confidence.signals[0] ? ` · ${confidence.signals[0]}` : ""}
          </p>
        ) : null}

        {matchScore.engineVersion ? (
          <p className="text-xs text-muted-foreground">Engine {matchScore.engineVersion}</p>
        ) : null}
      </CardContent>
    </Card>
  );
};
