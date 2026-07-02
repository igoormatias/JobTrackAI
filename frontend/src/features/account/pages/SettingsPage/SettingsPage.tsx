"use client";

import { AlertCircle } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/Button";

import { AccountSectionLayout } from "../../components/AccountSectionLayout";
import { SettingsForm } from "../../components/settings/SettingsForm";
import { SettingsFormSkeleton } from "../../components/settings/SettingsFormSkeleton";
import { useAccountSettings } from "../../hooks/use-account-settings";

export const SettingsPage = () => {
  const { settings, isLoading, isError, isSaving, saveSettings, refetch } = useAccountSettings();

  if (isLoading) {
    return (
      <AccountSectionLayout
        title="Preferências"
        description="Personalize tema, atualizações e exibição de vagas."
      >
        <SettingsFormSkeleton />
      </AccountSectionLayout>
    );
  }

  if (isError || !settings) {
    return (
      <AccountSectionLayout
        title="Preferências"
        description="Personalize tema, atualizações e exibição de vagas."
      >
        <EmptyState
          icon={AlertCircle}
          title="Não foi possível carregar as preferências"
          description="Tente novamente em alguns instantes."
          action={
            <Button type="button" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          }
        />
      </AccountSectionLayout>
    );
  }

  return (
    <AccountSectionLayout
      title="Preferências"
      description="Personalize tema, atualizações e exibição de vagas."
    >
      <SettingsForm settings={settings} isSaving={isSaving} onSubmit={saveSettings} />
    </AccountSectionLayout>
  );
};
