import { isAxiosError } from "axios";

import { completeOnboarding } from "@/features/auth/services/auth-service";
import type { OnboardingCompletePayload } from "@/features/auth/types";
import { createProfile, getProfile, updateProfile } from "@/services/profile-service";
import type { CreateProfilePayload, Profile, UpdateProfilePayload } from "@/types";

export const fetchOnboardingProfile = async (): Promise<Profile | null> => {
  try {
    return await getProfile();
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

export const saveOnboardingProfile = async (
  payload: CreateProfilePayload | UpdateProfilePayload,
  exists: boolean,
): Promise<Profile> => {
  if (exists) {
    return updateProfile(payload);
  }

  return createProfile(payload as CreateProfilePayload);
};

export const finalizeOnboarding = async (payload: OnboardingCompletePayload) => completeOnboarding(payload);
