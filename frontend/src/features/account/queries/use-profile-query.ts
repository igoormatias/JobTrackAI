"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invalidateCareerSurfaces } from "@/lib/query-client/invalidate-career-surfaces";
import { queryKeys } from "@/lib/query-client/query-keys";
import type { UpdateProfilePayload } from "@/types";

import { getProfile, updateProfile } from "../services";

const invalidatePersonalizedQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  invalidateCareerSurfaces(queryClient);
  void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobDetails.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
};

export const useProfileQuery = () =>
  useQuery({
    queryKey: queryKeys.profile.detail(),
    queryFn: getProfile,
    retry: false,
  });

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => {
      invalidatePersonalizedQueries(queryClient);
    },
  });
};
