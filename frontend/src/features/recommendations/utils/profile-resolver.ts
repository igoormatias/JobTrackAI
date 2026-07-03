import type { AuthProfile } from "@/features/auth/types";
import type { Profile, ProfessionalArea, Seniority, WorkModality } from "@/types";

import type { ProfileResolverDeps, ProfileResolverOptions, RecommendationProfile } from "../types/recommendation.types";

export const mapAuthProfileToRecommendation = (authProfile: AuthProfile): RecommendationProfile => ({
  area: (authProfile.professionalArea as ProfessionalArea) ?? null,
  seniority: (authProfile.seniority as Seniority) ?? null,
  modality: (authProfile.modality as WorkModality) ?? null,
  location: authProfile.location ?? "",
  locationPreference: authProfile.locationPreference ?? null,
  salaryBand: (authProfile.salaryBand as RecommendationProfile["salaryBand"]) ?? null,
  salaryExpectation: authProfile.salaryExpectation ?? null,
  skillNames: authProfile.skills ?? [],
});

export const mapProfileToRecommendation = (profile: Profile): RecommendationProfile => ({
  area: profile.area,
  seniority: profile.seniority,
  modality: profile.modality,
  location: profile.location,
  locationPreference: profile.locationPreference,
  salaryBand: profile.salaryBand,
  salaryExpectation: profile.salaryExpectation,
  skillNames: profile.skillNames.length > 0 ? profile.skillNames : profile.skills.map((s) => s.name),
});

export const createEmptyRecommendationProfile = (): RecommendationProfile => ({
  area: null,
  seniority: null,
  modality: null,
  location: "",
  locationPreference: null,
  salaryBand: null,
  salaryExpectation: null,
  skillNames: [],
});

export const resolveActiveProfile = (
  deps: ProfileResolverDeps,
  options: ProfileResolverOptions = {},
): RecommendationProfile => {
  const userId = options.userId ?? deps.getAuthUserId();

  if (userId) {
    const stored = deps.getUserProfile(userId);
    if (stored) {
      return mapProfileToRecommendation(stored);
    }
  }

  const authProfile = deps.getAuthProfile();
  if (authProfile?.professionalArea) {
    return mapAuthProfileToRecommendation(authProfile);
  }

  const fixtureProfile = options.fixtureProfile ?? deps.getFixtureProfile();
  if (fixtureProfile) {
    return mapProfileToRecommendation(fixtureProfile);
  }

  return createEmptyRecommendationProfile();
};
