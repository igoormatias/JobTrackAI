"use client";

import { type ReactNode } from "react";

import { Progress } from "@/components/ui/Progress";
import { Muted } from "@/components/typography";

export type OnboardingStepperProps = {
  stepIndex: number;
  totalSteps: number;
  children: ReactNode;
};

export const OnboardingStepper = ({ stepIndex, totalSteps, children }: OnboardingStepperProps) => {
  const progressValue = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Muted aria-live="polite">
          Passo {stepIndex + 1} de {totalSteps}
        </Muted>
        <Progress value={progressValue} aria-label={`Progresso: passo ${stepIndex + 1} de ${totalSteps}`} />
      </div>
      {children}
    </div>
  );
};
