import type { Job } from "@/types/job";
import type { Profile, ProfessionalArea, Seniority, WorkModality, ProfileLocation, SalaryBand, SalaryRange } from "@/types/profile";

export type RecommendationProfile = {
  area: ProfessionalArea | null;
  seniority: Seniority | null;
  modality: WorkModality | null;
  location: string;
  locationPreference: ProfileLocation | null;
  salaryBand: SalaryBand | null;
  salaryExpectation: SalaryRange | null;
  skillNames: string[];
};

export type MatchWeights = {
  skillMatch: number;
  modalityMatch: number;
  locationMatch: number;
  salaryMatch: number;
  seniorityMismatchPenalty: number;
  baseScore: number;
};

export type ScoredJob = Job & {
  matchScore: Job["matchScore"];
};

export type RecommendationContext = {
  profile: RecommendationProfile;
  jobs: Job[];
};

export type ProfileResolverOptions = {
  userId?: string;
  fixtureProfile?: Profile | null;
};

export type ProfileResolverDeps = {
  getUserProfile: (userId: string) => Profile | null;
  getAuthUserId: () => string | null;
  getAuthProfile: () => import("@/features/auth/types").AuthProfile | null;
  getFixtureProfile: () => Profile | null;
};
