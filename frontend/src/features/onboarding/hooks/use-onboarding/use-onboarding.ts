"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAuthContext } from "@/features/auth/context/AuthProvider";
import { queryKeys } from "@/lib/query-client/query-keys";

import { submitOnboarding } from "../../services/onboarding-service";
import type { OnboardingFormState, OnboardingStep } from "../../types";
import { ONBOARDING_STEPS } from "../../types";

const initialFormState = (): OnboardingFormState => ({
  professionalArea: "",
  seniority: "",
  modality: "remote",
  location: "",
  salaryExpectation: {
    min: 8000,
    max: 12000,
    currency: "BRL",
  },
  skills: [],
  blockedSkills: [],
});

export const useOnboarding = () => {
  const router = useRouter();
  const { setAuthState, refreshAuth } = useAuthContext();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<OnboardingFormState>(initialFormState);

  const step = ONBOARDING_STEPS[stepIndex] as OnboardingStep;

  const mutation = useMutation({
    mutationFn: submitOnboarding,
    onSuccess: async (response) => {
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
    },
  });

  const canContinue = useMemo(() => {
    switch (step) {
      case "area":
        return Boolean(form.professionalArea);
      case "seniority":
        return Boolean(form.seniority);
      case "modality":
        return Boolean(form.modality);
      case "location":
        return Boolean(form.location.trim());
      case "salary":
        return form.salaryExpectation.min > 0 && form.salaryExpectation.max >= form.salaryExpectation.min;
      case "skills":
        return form.skills.length > 0;
      default:
        return false;
    }
  }, [form, step]);

  const goNext = () => {
    if (stepIndex === ONBOARDING_STEPS.length - 1) {
      mutation.mutate(form);
      return;
    }

    setStepIndex((current) => current + 1);
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const updateForm = (patch: Partial<OnboardingFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const toggleSkill = (skill: string) => {
    setForm((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill],
    }));
  };

  return {
    step,
    stepIndex,
    totalSteps: ONBOARDING_STEPS.length,
    form,
    updateForm,
    toggleSkill,
    canContinue,
    goNext,
    goBack,
    isSubmitting: mutation.isPending,
    queryKey: queryKeys.auth.me(),
  };
};
