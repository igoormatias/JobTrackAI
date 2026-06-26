import type { OnboardingCompletePayload } from "@/features/auth/types";
import type { CreateProfilePayload, OnboardingProgress, Profile, SalaryBand, UpdateProfilePayload, WorkModality } from "@/types";

import type { OnboardingFormState, OnboardingStep } from "../types/onboarding.types";
import { salaryBandToRange } from "./salary-band-mapper";
import { formatLocationPreference } from "./location-formatter";

export const mapFormToProfilePayload = (
  form: OnboardingFormState,
  currentStep: OnboardingStep,
): CreateProfilePayload | UpdateProfilePayload => {
  const onboardingProgress: OnboardingProgress = {
    currentStep,
    lastSavedAt: new Date().toISOString(),
  };

  const salaryBand = form.salaryBand || null;
  const salaryExpectation = salaryBand ? salaryBandToRange(salaryBand) : null;

  return {
    area: form.area || null,
    seniority: form.seniority || null,
    modality: form.modality || null,
    locationPreference: form.locationPreference,
    location: formatLocationPreference(form.locationPreference),
    salaryBand,
    salaryExpectation,
    skillNames: form.skills,
    blockedSkills: form.blockedSkills,
    onboardingProgress,
    extensions: {},
  };
};

export const mapProfileToForm = (profile: Profile): OnboardingFormState => ({
  area: profile.area ?? "",
  skills: profile.skillNames.length > 0 ? profile.skillNames : profile.skills.map((skill) => skill.name),
  seniority: profile.seniority ?? "",
  modality: profile.modality ?? "",
  locationPreference: profile.locationPreference ?? {
    scope: "country",
    acceptsRelocation: false,
  },
  salaryBand: profile.salaryBand ?? "",
  blockedSkills: profile.blockedSkills,
});

export const mapFormToCompletePayload = (form: OnboardingFormState): OnboardingCompletePayload => ({
  professionalArea: form.area as OnboardingCompletePayload["professionalArea"],
  seniority: form.seniority as OnboardingCompletePayload["seniority"],
  modality: form.modality as WorkModality,
  location: formatLocationPreference(form.locationPreference),
  locationPreference: form.locationPreference,
  salaryBand: form.salaryBand as SalaryBand,
  salaryExpectation: salaryBandToRange(form.salaryBand as SalaryBand),
  skills: form.skills,
  blockedSkills: form.blockedSkills,
});
