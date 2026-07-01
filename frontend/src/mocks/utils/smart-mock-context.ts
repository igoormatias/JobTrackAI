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
  if (!fullJob) return application;

  const scored = engine.getScoredJob(fullJob);

  return {
    ...application,
    job: {
      id: scored.id,
      title: scored.title,
      company: scored.company,
      modality: scored.modality,
      location: scored.location,
      area: scored.area,
      matchScore: scored.matchScore,
      technologies: scored.technologies,
      sourceUrl: scored.sourceUrl,
      isFavorite: scored.isFavorite,
      updatedAt: scored.updatedAt,
    },
  };
};
