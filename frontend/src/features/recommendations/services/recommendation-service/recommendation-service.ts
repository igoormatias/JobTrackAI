import type { Application, Company, Job } from "@/types";

import {
  buildPersonalizedDashboard,
  buildPersonalizedNotifications,
  enrichJobsWithMatch,
  prioritizeCompaniesByArea,
  resolveActiveProfile,
  sortJobsByMatchAndDate,
} from "../../utils";
import type { ProfileResolverDeps, ProfileResolverOptions, RecommendationProfile } from "../../types/recommendation.types";

export const createRecommendationEngine = (deps: ProfileResolverDeps) => ({
  getActiveProfile: (options?: ProfileResolverOptions) => resolveActiveProfile(deps, options),

  getScoredJobs: (jobs: Job[], profile?: RecommendationProfile) => {
    const activeProfile = profile ?? resolveActiveProfile(deps);
    return sortJobsByMatchAndDate(enrichJobsWithMatch(jobs, activeProfile));
  },

  getScoredJob: (job: Job, profile?: RecommendationProfile) => {
    const activeProfile = profile ?? resolveActiveProfile(deps);
    return enrichJobsWithMatch([job], activeProfile)[0]!;
  },

  getPersonalizedDashboard: (jobs: Job[], applications: Application[], profile?: RecommendationProfile) => {
    const activeProfile = profile ?? resolveActiveProfile(deps);
    const scoredJobs = enrichJobsWithMatch(jobs, activeProfile);
    return buildPersonalizedDashboard({ jobs: scoredJobs, applications, profile: activeProfile });
  },

  getPersonalizedNotifications: (
    userId: string,
    jobs: Job[],
    applications: Application[],
    profile?: RecommendationProfile,
  ) => {
    const activeProfile = profile ?? resolveActiveProfile(deps);
    const scoredJobs = enrichJobsWithMatch(jobs, activeProfile);
    return buildPersonalizedNotifications({ userId, jobs: scoredJobs, applications, profile: activeProfile });
  },

  getPrioritizedCompanies: (companies: Company[], profile?: RecommendationProfile) => {
    const activeProfile = profile ?? resolveActiveProfile(deps);
    return prioritizeCompaniesByArea(companies, activeProfile.area);
  },
});

export type RecommendationEngine = ReturnType<typeof createRecommendationEngine>;

export { computeMatchScore, enrichJobsWithMatch, sortJobsByMatchAndDate } from "../../utils";
