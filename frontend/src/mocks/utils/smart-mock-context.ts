import { getAuthStore } from "@/mocks/fixtures/auth-store";
import { getFixtureStore } from "@/mocks/fixtures";
import { getUserProfile } from "@/mocks/fixtures/profile-store";

import type { Application, Job } from "@/types";

import { createRecommendationEngine } from "@/features/recommendations/services/recommendation-service";

const engine = createRecommendationEngine({
  getUserProfile,
  getAuthUserId: () => getAuthStore().user.id,
  getAuthProfile: () => getAuthStore().profile,
  getFixtureProfile: () => getFixtureStore().profile,
});

export const getActiveRecommendationProfile = engine.getActiveProfile;
export const getScoredJobs = engine.getScoredJobs;
export const getScoredJob = engine.getScoredJob;
export const getPersonalizedDashboard = engine.getPersonalizedDashboard;
export const getPersonalizedNotifications = engine.getPersonalizedNotifications;
export const getPrioritizedCompanies = engine.getPrioritizedCompanies;

export const enrichApplicationJob = (application: Application, jobs: Job[]): Application => {
  const fullJob = jobs.find((job) => job.id === application.jobId);
  const matchScore = fullJob ? engine.getScoredJob(fullJob).matchScore : application.job.matchScore;

  return {
    ...application,
    job: {
      ...application.job,
      matchScore,
    },
  };
};
