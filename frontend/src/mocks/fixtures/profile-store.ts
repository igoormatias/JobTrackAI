import type { CreateProfilePayload, Profile, UpdateProfilePayload } from "@/types";

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
  skills: [],
  skillNames: [],
  technologies: [],
  avoidedTechnologies: [],
  bio: "",
  linkedinUrl: null,
  githubUrl: null,
  onboardingProgress: null,
  onboardingCompleted: false,
  extensions: {},
  updatedAt: new Date().toISOString(),
});

let profilesByUser = new Map<string, Profile>();

export const getProfileStore = (): Map<string, Profile> => profilesByUser;

export const getUserProfile = (userId: string): Profile | null => profilesByUser.get(userId) ?? null;

export const createUserProfile = (userId: string, payload: CreateProfilePayload): Profile => {
  const profile: Profile = {
    ...createEmptyProfile(userId),
    ...payload,
    id: `profile_${userId}`,
    userId,
    skillNames: payload.skillNames ?? [],
    extensions: payload.extensions ?? {},
    updatedAt: new Date().toISOString(),
  };

  profilesByUser.set(userId, profile);
  return profile;
};

export const updateUserProfile = (userId: string, payload: UpdateProfilePayload): Profile | null => {
  const existing = profilesByUser.get(userId);
  if (!existing) return null;

  const updated: Profile = {
    ...existing,
    ...payload,
    skillNames: payload.skillNames ?? existing.skillNames,
    extensions: {
      ...existing.extensions,
      ...(payload.extensions ?? {}),
    },
    updatedAt: new Date().toISOString(),
  };

  profilesByUser.set(userId, updated);
  return updated;
};

export const resetProfileStore = (): void => {
  profilesByUser = new Map();
};

export const syncProfileStoreFromFixture = (profile: Profile): void => {
  profilesByUser.set(profile.userId, profile);
};
