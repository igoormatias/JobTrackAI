"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import { getSettings, updateSettings } from "@/services/settings-service";
import type { UpdateSettingsPayload } from "@/types";

export const useSettings = () =>
  useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: getSettings,
  });

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => updateSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
};
