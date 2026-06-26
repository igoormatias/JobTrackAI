import type { AuthPermissions, AuthProfile, AuthUser } from "../types/auth.types.js";

export type AuthResponseDto = {
  data: {
    user: AuthUser;
    profile: AuthProfile | null;
    permissions: AuthPermissions;
  };
  message?: string;
};

export type MeResponseDto = AuthResponseDto;

export type OnboardingCompleteResponseDto = {
  data: {
    user: AuthUser;
  };
  message?: string;
};
