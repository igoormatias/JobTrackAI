"use client";

import { Label } from "@/components/ui/Label";
import { Slider } from "@/components/ui/Slider";

import { SALARY_BAND_OPTIONS } from "../../constants/salary-bands";
import type { OnboardingFormState } from "../../types/onboarding.types";
import { indexToSalaryBand, salaryBandToIndex } from "../../utils/salary-band-mapper";
import type { SalaryBand } from "@/types";

export type SalaryStepProps = {
  form: OnboardingFormState;
  onChange: (salaryBand: SalaryBand) => void;
  error?: string | null;
};

export const SalaryStep = ({ form, onChange, error }: SalaryStepProps) => {
  const currentIndex = salaryBandToIndex(form.salaryBand);
  const currentLabel = SALARY_BAND_OPTIONS[currentIndex]?.label ?? "Selecione uma faixa";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="onboarding-salary">Faixa salarial</Label>
        <p id="onboarding-salary-help" className="text-sm text-muted-foreground">
          Arraste o controle para selecionar sua pretensão salarial mensal.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="mb-6 text-center text-lg font-semibold text-primary" aria-live="polite">
          {currentLabel}
        </p>
        <Slider
          id="onboarding-salary"
          min={0}
          max={SALARY_BAND_OPTIONS.length - 1}
          step={1}
          value={[currentIndex]}
          onValueChange={(value) => onChange(indexToSalaryBand(value[0] ?? 0))}
          aria-describedby="onboarding-salary-help"
        />
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          {SALARY_BAND_OPTIONS.map((option) => (
            <span key={option.value}>{option.label}</span>
          ))}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
