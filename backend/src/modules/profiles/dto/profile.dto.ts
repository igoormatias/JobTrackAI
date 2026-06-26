import type { CreateProfileInput, Profile, UpdateProfileInput } from "../types/profile.types.js";

export type ProfileResponseDto = {
  data: Profile;
  message?: string;
};

export type { CreateProfileInput, UpdateProfileInput, Profile };
