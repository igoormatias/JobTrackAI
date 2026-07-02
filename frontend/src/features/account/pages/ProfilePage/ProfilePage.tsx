"use client";

import { AlertCircle } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/Button";

import { AccountSectionLayout } from "../../components/AccountSectionLayout";
import { ProfileForm } from "../../components/profile/ProfileForm";
import { ProfileFormSkeleton } from "../../components/profile/ProfileFormSkeleton";
import { ProfileReadOnlyFields } from "../../components/profile/ProfileReadOnlyFields";
import { useAccountProfile } from "../../hooks/use-account-profile";

export const ProfilePage = () => {
  const { profile, isLoading, isError, isSaving, saveProfile, refetch } = useAccountProfile();

  if (isLoading) {
    return (
      <AccountSectionLayout
        title="Perfil"
        description="Atualize suas informações profissionais para melhorar recomendações de vagas."
      >
        <ProfileFormSkeleton />
      </AccountSectionLayout>
    );
  }

  if (isError || !profile?.user) {
    return (
      <AccountSectionLayout
        title="Perfil"
        description="Atualize suas informações profissionais para melhorar recomendações de vagas."
      >
        <EmptyState
          icon={AlertCircle}
          title="Não foi possível carregar o perfil"
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
      title="Perfil"
      description="Atualize suas informações profissionais para melhorar recomendações de vagas."
    >
      <ProfileReadOnlyFields user={profile.user} />
      <ProfileForm profile={profile} isSaving={isSaving} onSubmit={saveProfile} />
    </AccountSectionLayout>
  );
};
