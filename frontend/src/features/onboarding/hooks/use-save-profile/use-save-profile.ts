"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { completeOnboarding } from "@/features/auth/services/auth-service";
import type { OnboardingCompletePayload } from "@/features/auth/types";
import { queryKeys } from "@/lib/query-client/query-keys";
import type { CreateProfilePayload, UpdateProfilePayload } from "@/types";

import { onboardingQueryKeys } from "../../queries/onboarding-query-keys";
import { fetchOnboardingProfile, saveOnboardingProfile } from "../../services/onboarding-service";

export const useSaveProfile = () => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async ({
      payload,
      exists,
    }: {
      payload: CreateProfilePayload | UpdateProfilePayload;
      exists: boolean;
    }) => saveOnboardingProfile(payload, exists),
     onSuccess: (profile) => {
      queryClient.setQueryData(onboardingQueryKeys.profile(), profile);
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (payload: OnboardingCompletePayload) => completeOnboarding(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      void queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.profile() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
    },
  });

  return {
    saveProfile: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    completeOnboarding: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
    loadProfile: fetchOnboardingProfile,
  };
};
