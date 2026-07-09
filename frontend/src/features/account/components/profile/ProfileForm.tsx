"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { SkillsSelector } from "@/components/data-display/SkillsSelector";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { AREA_OPTIONS } from "@/features/onboarding/constants/areas";
import {
  MODALITY_OPTIONS,
  SENIORITY_OPTIONS,
} from "@/features/onboarding/constants/onboarding-options";
import { getSkillsForArea } from "@/features/onboarding/constants/skills-by-area";
import { SalaryStep } from "@/features/onboarding/components/steps/SalaryStep";
import type { OnboardingFormState } from "@/features/onboarding/types/onboarding.types";
import type { AccountProfile } from "@/types";

import { AccountLocationFields } from "./AccountLocationFields";
import { UnsavedChangesBar } from "../UnsavedChangesBar";
import {
  accountProfileSchema,
  type AccountProfileFormValues,
} from "../../schemas/account-profile.schema";

export type ProfileFormProps = {
  profile: AccountProfile;
  isSaving?: boolean;
  onSubmit: (values: AccountProfileFormValues) => void;
};

const ACCOUNT_SENIORITIES = ["junior", "mid", "senior", "specialist", "lead"] as const;

const toFormValues = (profile: AccountProfile): AccountProfileFormValues => ({
  area: profile.area,
  seniority: ACCOUNT_SENIORITIES.includes(profile.seniority as (typeof ACCOUNT_SENIORITIES)[number])
    ? (profile.seniority as AccountProfileFormValues["seniority"])
    : null,
  modality: profile.modality,
  locationPreference: profile.locationPreference ?? {
    scope: "country",
    acceptsRelocation: false,
  },
  salaryBand: profile.salaryBand,
  skillNames: profile.skillNames,
});

export const ProfileForm = ({ profile, isSaving = false, onSubmit }: ProfileFormProps) => {
  const form = useForm<AccountProfileFormValues>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: toFormValues(profile),
    mode: "onChange",
  });

  const { watch, setValue, handleSubmit, reset, formState } = form;
  const area = watch("area");
  const skillOptions = getSkillsForArea(area ?? "").map((skill) => ({ value: skill, label: skill }));

  useEffect(() => {
    reset(toFormValues(profile));
  }, [profile, reset]);

  const submit = handleSubmit((values) => {
    onSubmit(values);
    toast.success("Perfil atualizado com sucesso");
  });

  return (
    <form className="space-y-6" onSubmit={submit}>
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="account-area">Área profissional</Label>
          <Select
            value={area ?? ""}
            onValueChange={(value) => setValue("area", value as AccountProfileFormValues["area"], { shouldDirty: true })}
          >
            <SelectTrigger id="account-area">
              <SelectValue placeholder="Selecione a área" />
            </SelectTrigger>
            <SelectContent>
              {AREA_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-seniority">Senioridade</Label>
          <Select
            value={watch("seniority") ?? ""}
            onValueChange={(value) =>
              setValue("seniority", value as AccountProfileFormValues["seniority"], { shouldDirty: true })
            }
          >
            <SelectTrigger id="account-seniority">
              <SelectValue placeholder="Selecione a senioridade" />
            </SelectTrigger>
            <SelectContent>
              {SENIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SkillsSelector
          id="account-skills"
          label="Competências"
          helpText="Selecione as competências que você domina na área escolhida."
          placeholder="Adicionar competência..."
          options={skillOptions}
          value={watch("skillNames")}
          onChange={(skills) => setValue("skillNames", skills, { shouldDirty: true })}
          useApiSuggestions
          error={formState.errors.skillNames?.message}
        />

        <div className="space-y-2">
          <Label htmlFor="account-modality">Modalidade</Label>
          <Select
            value={watch("modality") ?? ""}
            onValueChange={(value) =>
              setValue("modality", value as AccountProfileFormValues["modality"], { shouldDirty: true })
            }
          >
            <SelectTrigger id="account-modality">
              <SelectValue placeholder="Selecione a modalidade" />
            </SelectTrigger>
            <SelectContent>
              {MODALITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AccountLocationFields
          value={watch("locationPreference")}
          onChange={(locationPreference) => setValue("locationPreference", locationPreference, { shouldDirty: true })}
          error={formState.errors.locationPreference?.message}
        />

        <SalaryStep
          form={
            {
              salaryBand: watch("salaryBand") ?? "8k_12k",
            } as OnboardingFormState
          }
          onChange={(salaryBand) => setValue("salaryBand", salaryBand, { shouldDirty: true })}
        />
      </div>

      <UnsavedChangesBar
        visible={formState.isDirty}
        isSaving={isSaving}
        onDiscard={() => reset(toFormValues(profile))}
        onSave={() => void submit()}
      />
    </form>
  );
};
