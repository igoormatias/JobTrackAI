"use client";

import { AlertCircle } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/Button";
import { GoogleCalendarIntegrationCard } from "@/features/calendar/components/GoogleCalendarIntegrationCard";

import { AccountSectionLayout } from "../../components/AccountSectionLayout";
import { SettingsForm } from "../../components/settings/SettingsForm";
import { SettingsFormSkeleton } from "../../components/settings/SettingsFormSkeleton";
import { useAccountSettings } from "../../hooks/use-account-settings";

const SettingsPageContent = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const isIntegrations = tab === "integrations";
  const { settings, isLoading, isError, isSaving, saveSettings, refetch } = useAccountSettings();

  if (isIntegrations) {
    return (
      <AccountSectionLayout
        title="Integrações"
        description="Conecte serviços externos para enriquecer sua experiência."
      >
        <GoogleCalendarIntegrationCard />
      </AccountSectionLayout>
    );
  }

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

export const SettingsPage = () => (
  <Suspense fallback={null}>
    <SettingsPageContent />
  </Suspense>
);
