"use client";

import { cn } from "@/lib/utils";
import type { Seniority } from "@/types";

import { SENIORITY_OPTIONS } from "../../constants/onboarding-options";
import type { OnboardingFormState } from "../../types/onboarding.types";

export type SeniorityStepProps = {
  form: OnboardingFormState;
  onChange: (seniority: Seniority) => void;
  error?: string | null;
};

export const SeniorityStep = ({ form, onChange, error }: SeniorityStepProps) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Senioridade">
      {SENIORITY_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={form.seniority === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "cursor-pointer rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors",
            form.seniority === option.value && "border-primary bg-primary/10 text-primary",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
    {error ? (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    ) : null}
  </div>
);
