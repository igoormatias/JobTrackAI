import type { AuthProfile, AuthUser } from "../../types/auth.types.js";

export type StoredAuthUser = AuthUser & {
  profile: AuthProfile | null;
};

export type UpsertGoogleUserInput = {
  name: string;
  email: string;
  avatar: string | null;
  provider: "google";
};

export interface AuthUserRepository {
  findByEmail(email: string): Promise<StoredAuthUser | null>;
  findById(id: string): Promise<StoredAuthUser | null>;
  upsertFromGoogle(input: UpsertGoogleUserInput): Promise<StoredAuthUser>;
  updateProfile(userId: string, profile: AuthProfile, onboardingCompleted?: boolean): Promise<StoredAuthUser | null>;
}
