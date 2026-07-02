"use client";

import { useCurrentUser } from "@/features/auth";
import type { AccountProfile, UpdateProfilePayload } from "@/types";

import { useProfileQuery, useUpdateProfileMutation } from "../../queries";
import type { AccountProfileFormValues } from "../../schemas/account-profile.schema";

const buildLocationLabel = (values: AccountProfileFormValues): string => {
  const { locationPreference } = values;

  if (locationPreference.scope === "country") return "Brasil";
  if (locationPreference.scope === "state") return locationPreference.state ?? "";
  return locationPreference.city ?? "";
};

const toAccountProfile = (profile: AccountProfile, userFallback: AccountProfile["user"]): AccountProfile => ({
  ...profile,
  user: profile.user ?? userFallback,
});

export const useAccountProfile = () => {
  const profileQuery = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();
  const { user } = useCurrentUser();

  const userFallback: AccountProfile["user"] = {
    name: user?.name ?? "",
    email: user?.email ?? "",
    avatarUrl: user?.avatar ?? null,
  };

  const profile = profileQuery.data
    ? toAccountProfile(profileQuery.data as AccountProfile, userFallback)
    : undefined;

  const saveProfile = (values: AccountProfileFormValues) => {
    const payload: UpdateProfilePayload = {
      area: values.area,
      seniority: values.seniority,
      modality: values.modality,
      locationPreference: values.locationPreference,
      location: buildLocationLabel(values),
      salaryBand: values.salaryBand,
      skillNames: values.skillNames,
    };

    updateMutation.mutate(payload);
  };

  return {
    profile,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    isSaving: updateMutation.isPending,
    saveProfile,
    refetch: profileQuery.refetch,
  };
};
