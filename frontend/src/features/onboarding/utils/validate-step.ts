import type { OnboardingFormState, OnboardingStep } from "../types/onboarding.types";
import { stepSchemas } from "../schemas/onboarding-schemas";

const getStepPayload = (step: OnboardingStep, form: OnboardingFormState) => {
  switch (step) {
    case "area":
      return { area: form.area };
    case "skills":
      return { skills: form.skills };
    case "seniority":
      return { seniority: form.seniority };
    case "modality":
      return { modality: form.modality };
    case "location":
      return { locationPreference: form.locationPreference };
    case "salary":
      return { salaryBand: form.salaryBand };
    case "summary":
      return {
        area: form.area,
        skills: form.skills,
        seniority: form.seniority,
        modality: form.modality,
        locationPreference: form.locationPreference,
        salaryBand: form.salaryBand,
      };
    default:
      return {};
  }
};

export const validateOnboardingStep = (step: OnboardingStep, form: OnboardingFormState) => {
  const schema = stepSchemas[step];
  return schema.safeParse(getStepPayload(step, form));
};

export const getStepValidationError = (step: OnboardingStep, form: OnboardingFormState): string | null => {
  const result = validateOnboardingStep(step, form);

  if (result.success) {
    return null;
  }

  return result.error.issues[0]?.message ?? "Preencha os campos obrigatórios";
};
