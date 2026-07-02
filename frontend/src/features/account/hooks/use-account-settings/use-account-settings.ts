"use client";

import { useEffect } from "react";

import { useSettings, useUpdateSettings } from "@/features/settings";
import { useTheme } from "@/providers/theme-provider";

import type { AccountSettingsFormValues } from "../../schemas/account-settings.schema";

export const useAccountSettings = () => {
  const settingsQuery = useSettings();
  const updateMutation = useUpdateSettings();
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
