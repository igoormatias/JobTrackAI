"use client";

import { MultiSelect } from "@/components/data-display/DataDisplay";

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
    <MultiSelect
      id="onboarding-skills"
      label="Competências principais"
      helpText="Selecione as competências que você domina. As opções dependem da área escolhida."
      placeholder="Adicionar competência..."
      options={options}
      value={form.skills}
      onChange={onChange}
      searchable
      error={error ?? undefined}
    />
  );
};
