"use client";

import { SkillsSelector } from "@/components/data-display/SkillsSelector";

import { getSkillsForArea } from "../../constants/skills-by-area";
import type { OnboardingFormState } from "../../types/onboarding.types";

export type SkillsStepProps = {
  form: OnboardingFormState;
  onChange: (skills: string[]) => void;
  error?: string | null;
};

export const SkillsStep = ({ form, onChange, error }: SkillsStepProps) => {
  const options = getSkillsForArea(form.area).map((skill) => ({
    value: skill,
    label: skill,
  }));

  return (
    <SkillsSelector
      id="onboarding-skills"
      label="Competências principais"
      helpText="Selecione as competências que você domina. As opções dependem da área escolhida."
      placeholder="Adicionar competência..."
      options={options}
      value={form.skills}
      onChange={onChange}
      useApiSuggestions
      error={error ?? undefined}
    />
  );
};
