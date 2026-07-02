"use client";

import { cn } from "@/lib/utils";
import type { WorkModality } from "@/types";

import { MODALITY_OPTIONS } from "../../constants/onboarding-options";
import type { OnboardingFormState } from "../../types/onboarding.types";

export type ModalityStepProps = {
  form: OnboardingFormState;
  onChange: (modality: WorkModality) => void;
  error?: string | null;
};

export const ModalityStep = ({ form, onChange, error }: ModalityStepProps) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Modelo de trabalho">
      {MODALITY_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={form.modality === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "cursor-pointer rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors",
            form.modality === option.value && "border-primary bg-primary/10 text-primary",
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
