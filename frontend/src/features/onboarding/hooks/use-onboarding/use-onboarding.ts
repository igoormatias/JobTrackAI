"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuthContext } from "@/features/auth/context/AuthProvider";

import { onboardingQueryKeys } from "../../queries/onboarding-query-keys";
import {
  ONBOARDING_STEPS,
  createInitialFormState,
  type OnboardingFormState,
  type OnboardingStep,
} from "../../types/onboarding.types";
import {
  clearDraftFromStorage,
  loadDraftFromStorage,
  mergeDraftWithProfile,
  saveDraftToStorage,
} from "../../utils/draft-storage";
import { mapFormToCompletePayload, mapFormToProfilePayload, mapProfileToForm } from "../../utils/map-form-to-profile";
import { getStepValidationError, validateOnboardingStep } from "../../utils/validate-step";
import { useSaveProfile } from "../use-save-profile";

export const useOnboarding = () => {
  const router = useRouter();
  const { user, refreshAuth, setAuthState } = useAuthContext();
  const { saveProfile, completeOnboarding, isSaving, isCompleting, loadProfile } = useSaveProfile();

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<OnboardingFormState>(createInitialFormState);
  const [stepError, setStepError] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = ONBOARDING_STEPS[stepIndex] as OnboardingStep;

  const profileQuery = useQuery({
    queryKey: onboardingQueryKeys.profile(),
    queryFn: loadProfile,
    enabled: Boolean(user?.id),
    retry: false,
  });

  useEffect(() => {
    if (!user?.id || profileQuery.isLoading || isHydrated) return;

    const profile = profileQuery.data;
    const localDraft = loadDraftFromStorage(user.id);

    if (profile) {
      setProfileExists(true);
      const merged = mergeDraftWithProfile(
        profile.onboardingProgress?.currentStep,
        localDraft,
        mapProfileToForm(profile),
      );
      setForm(merged.form);
      setStepIndex(ONBOARDING_STEPS.indexOf(merged.step));
    } else if (localDraft) {
      setForm({ ...createInitialFormState(), ...localDraft.form });
      setStepIndex(ONBOARDING_STEPS.indexOf(localDraft.currentStep));
    }

    setIsHydrated(true);
  }, [user?.id, profileQuery.data, profileQuery.isLoading, isHydrated]);

  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.replace("/dashboard");
    }
  }, [user?.onboardingCompleted, router]);

  const persistDraft = useCallback(
    async (nextForm: OnboardingFormState, nextStep: OnboardingStep) => {
      if (!user?.id) return;

      saveDraftToStorage(user.id, {
        currentStep: nextStep,
        form: nextForm,
        savedAt: new Date().toISOString(),
      });

      const payload = mapFormToProfilePayload(nextForm, nextStep);

      try {
        const saved = await saveProfile({ payload, exists: profileExists });
        setProfileExists(true);
        return saved;
      } catch {
        return null;
      }
    },
    [profileExists, saveProfile, user?.id],
  );

  const scheduleAutoSave = useCallback(
    (nextForm: OnboardingFormState, nextStep: OnboardingStep) => {
      if (!user?.id) return;

      saveDraftToStorage(user.id, {
        currentStep: nextStep,
        form: nextForm,
        savedAt: new Date().toISOString(),
      });

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        void persistDraft(nextForm, nextStep);
      }, 500);
    },
    [persistDraft, user?.id],
  );

  const updateForm = useCallback(
    (patch: Partial<OnboardingFormState>) => {
      setForm((current) => {
        const next = { ...current, ...patch };
        scheduleAutoSave(next, step);
        return next;
      });
      setStepError(null);
    },
    [scheduleAutoSave, step],
  );

  const canContinue = useMemo(() => validateOnboardingStep(step, form).success, [form, step]);

  const goNext = async () => {
    const validation = validateOnboardingStep(step, form);

    if (!validation.success) {
      setStepError(getStepValidationError(step, form));
      return;
    }

    if (step === "summary") {
      const payload = mapFormToCompletePayload(form);
      await persistDraft(form, step);
      const response = await completeOnboarding(payload);

      if (user?.id) {
        clearDraftFromStorage(user.id);
      }

      await refreshAuth();
      setAuthState({
        user: response.user,
        profile: null,
        permissions: {
          canAccessApp: true,
          canManageSettings: true,
        },
      });
      router.replace("/dashboard");
      return;
    }

    const nextIndex = stepIndex + 1;
    const nextStep = ONBOARDING_STEPS[nextIndex] as OnboardingStep;
    await persistDraft(form, nextStep);
    setStepIndex(nextIndex);
    setStepError(null);
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
    setStepError(null);
  };

  const goToStep = (targetStep: OnboardingStep) => {
    const targetIndex = ONBOARDING_STEPS.indexOf(targetStep);
    if (targetIndex >= 0) {
      setStepIndex(targetIndex);
      setStepError(null);
    }
  };

  return {
    step,
    stepIndex,
    totalSteps: ONBOARDING_STEPS.length,
    form,
    updateForm,
    canContinue,
    stepError,
    goNext,
    goBack,
    goToStep,
    isSubmitting: isSaving || isCompleting,
    isLoading: profileQuery.isLoading || !isHydrated,
    queryKey: onboardingQueryKeys.profile(),
  };
};
