"use client";

import { CircularProgress } from "@/components/ui/Progress";
import { cn } from "@/lib/utils";

export type JobMatchScoreCircleProps = {
  score: number;
  label: string;
  className?: string;
};

export const JobMatchScoreCircle = ({ score, label, className }: JobMatchScoreCircleProps) => (
  <div className={cn("flex items-center gap-4", className)}>
    <div className="relative flex h-24 w-24 items-center justify-center">
      <CircularProgress value={score} size={96} strokeWidth={6} aria-label={`${score}% de compatibilidade`} />
      <span className="absolute text-xl font-bold text-foreground">{score}%</span>
    </div>
    <div>
      <p className="text-lg font-semibold text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">Compatibilidade com seu perfil</p>
    </div>
  </div>
);
