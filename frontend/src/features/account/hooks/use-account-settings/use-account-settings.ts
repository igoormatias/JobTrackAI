"use client";

import { useEffect } from "react";

import { useTheme } from "@/providers/theme-provider";

import { useSettingsQuery, useUpdateSettingsMutation } from "../../queries";
import type { AccountSettingsFormValues } from "../../schemas/account-settings.schema";

export const useAccountSettings = () => {
  const settingsQuery = useSettingsQuery();
  const updateMutation = useUpdateSettingsMutation();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (settingsQuery.data?.theme) {
      setTheme(settingsQuery.data.theme);
    }
  }, [settingsQuery.data?.theme, setTheme]);

  const saveSettings = (values: AccountSettingsFormValues) => {
    updateMutation.mutate(values);
  };

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    isSaving: updateMutation.isPending,
    saveSettings,
    refetch: settingsQuery.refetch,
  };
};
