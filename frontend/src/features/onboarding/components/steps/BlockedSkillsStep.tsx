"use client";

import { MultiSelect } from "@/components/data-display/DataDisplay";

import { getBlockedSkillsForArea } from "../../constants/blocked-skills-by-area";
import type { OnboardingFormState } from "../../types/onboarding.types";

export type BlockedSkillsStepProps = {
  form: OnboardingFormState;
  onChange: (blockedSkills: string[]) => void;
  error?: string | null;
};

export const BlockedSkillsStep = ({ form, onChange, error }: BlockedSkillsStepProps) => {
  const options = getBlockedSkillsForArea(form.area).map((skill) => ({
    value: skill,
    label: skill,
  }));

  return (
    <MultiSelect
      id="onboarding-blocked-skills"
      label="Competências que não deseja"
      helpText="Opcional. Marque tecnologias ou competências que prefere evitar."
      placeholder="Adicionar competência..."
      options={options}
      value={form.blockedSkills}
      onChange={onChange}
      searchable
      error={error ?? undefined}
    />
  );
};
