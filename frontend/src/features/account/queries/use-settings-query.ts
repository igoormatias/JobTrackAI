"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client/query-keys";
import type { UpdateSettingsPayload } from "@/types";

import { getSettings, updateSettings } from "../services";

export const useSettingsQuery = () =>
  useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: getSettings,
  });

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => updateSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
};
