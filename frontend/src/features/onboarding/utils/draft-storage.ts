import type { OnboardingFormState, OnboardingStep } from "../types/onboarding.types";
import { createInitialFormState } from "../types/onboarding.types";

const STORAGE_PREFIX = "jobtrack:onboarding-draft:";

export type OnboardingDraft = {
  currentStep: OnboardingStep;
  form: OnboardingFormState;
  savedAt: string;
};

export const getDraftStorageKey = (userId: string): string => `${STORAGE_PREFIX}${userId}`;

export const saveDraftToStorage = (userId: string, draft: OnboardingDraft): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getDraftStorageKey(userId), JSON.stringify(draft));
};

export const loadDraftFromStorage = (userId: string): OnboardingDraft | null => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(getDraftStorageKey(userId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    return null;
  }
};

export const clearDraftFromStorage = (userId: string): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getDraftStorageKey(userId));
};

export const mergeDraftWithProfile = (
  profileStep: OnboardingStep | null | undefined,
  localDraft: OnboardingDraft | null,
  profileForm: Partial<OnboardingFormState>,
): { step: OnboardingStep; form: OnboardingFormState } => {
  const baseForm = { ...createInitialFormState(), ...profileForm };
  const localStep = localDraft?.currentStep;
  const serverStep = profileStep;

  const stepIndex = (step: OnboardingStep | null | undefined): number => {
    if (!step) return -1;
    const steps: OnboardingStep[] = [
      "area",
      "skills",
      "seniority",
      "modality",
      "location",
      "salary",
      "summary",
    ];
    return steps.indexOf(step);
  };

  const resolvedStep =
    stepIndex(localStep) > stepIndex(serverStep ?? undefined)
      ? (localStep as OnboardingStep)
      : (serverStep ?? localStep ?? "area");

  const form = localDraft?.form
    ? { ...baseForm, ...localDraft.form }
    : baseForm;

  return { step: resolvedStep, form };
};
