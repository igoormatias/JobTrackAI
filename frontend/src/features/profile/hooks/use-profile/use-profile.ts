"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import { getProfile, updateProfile } from "@/services/profile-service";
import type { UpdateProfilePayload } from "@/types";

const invalidatePersonalizedQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.pipeline.all });
};

export const useProfile = () =>
  useQuery({
    queryKey: queryKeys.profile.detail(),
    queryFn: getProfile,
    retry: false,
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => {
      invalidatePersonalizedQueries(queryClient);
    },
  });
};
