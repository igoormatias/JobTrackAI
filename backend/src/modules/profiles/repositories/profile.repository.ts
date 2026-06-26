import type { CreateProfileInput, Profile, UpdateProfileInput } from "../types/profile.types.js";

const createEmptyProfile = (userId: string): Profile => ({
  id: `profile_${userId}`,
  userId,
  headline: "",
  area: null,
  seniority: null,
  modality: null,
  location: "",
  locationPreference: null,
  salaryExpectation: null,
  salaryBand: null,
  skillNames: [],
  blockedSkills: [],
  bio: "",
  linkedinUrl: null,
  githubUrl: null,
  onboardingProgress: null,
  onboardingCompleted: false,
  extensions: {},
  updatedAt: new Date().toISOString(),
});

let profiles = new Map<string, Profile>();

export class ProfileRepository {
  findByUserId(userId: string): Profile | null {
    return profiles.get(userId) ?? null;
  }

  create(userId: string, input: CreateProfileInput): Profile {
    const profile: Profile = {
      ...createEmptyProfile(userId),
      ...input,
      id: `profile_${userId}`,
      userId,
      updatedAt: new Date().toISOString(),
    };

    profiles.set(userId, profile);
    return profile;
  }

  update(userId: string, input: UpdateProfileInput): Profile | null {
    const existing = profiles.get(userId);
    if (!existing) return null;

    const updated: Profile = {
      ...existing,
      ...input,
      extensions: {
        ...existing.extensions,
        ...(input.extensions ?? {}),
      },
      updatedAt: new Date().toISOString(),
    };

    profiles.set(userId, updated);
    return updated;
  }

  markComplete(userId: string): Profile | null {
    return this.update(userId, { onboardingCompleted: true });
  }

  reset(): void {
    profiles = new Map();
  }
}

export const profileRepository = new ProfileRepository();
