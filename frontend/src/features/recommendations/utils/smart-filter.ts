import type { Job } from "@/types/job";

import { SKILLS_BY_AREA } from "@/features/onboarding/constants/skills-by-area";

import { computeMatchScore } from "./match-score";
import type { RecommendationProfile } from "../types/recommendation.types";

const normalize = (value: string): string => value.toLowerCase().trim();

const getAreaSkillBoost = (profile: RecommendationProfile, job: Job): number => {
  if (!profile.area) return 0;

  let boost = 0;

  if (job.area === profile.area) {
    boost += 5;
  }

  const areaSkills = SKILLS_BY_AREA[profile.area] ?? [];
  const jobTechs = job.technologies.map((tech) => normalize(tech.name));

  const overlap = areaSkills.filter((skill) =>
    jobTechs.some((tech) => tech.includes(normalize(skill)) || normalize(skill).includes(tech)),
  );

  boost += Math.min(overlap.length * 2, 10);

  return boost;
};

export const enrichJobWithMatch = (job: Job, profile: RecommendationProfile): Job => {
  const baseScore = computeMatchScore(job, profile);
  const boost = getAreaSkillBoost(profile, job);
  const boostedScore = Math.max(0, Math.min(100, baseScore.score + boost));

  return {
    ...job,
    matchScore: {
      ...baseScore,
      score: boostedScore,
      label:
        boostedScore >= 90
          ? "excellent"
          : boostedScore >= 75
            ? "good"
            : boostedScore >= 60
              ? "fair"
              : "low",
    },
  };
};

export const enrichJobsWithMatch = (jobs: Job[], profile: RecommendationProfile): Job[] =>
  jobs.map((job) => enrichJobWithMatch(job, profile));

export const getCompatibleJobs = (jobs: Job[], profile: RecommendationProfile, minScore = 60): Job[] => {
  const scored = enrichJobsWithMatch(jobs, profile);
  return scored.filter((job) => job.matchScore.score >= minScore);
};

export const prioritizeJobsForProfile = (jobs: Job[], profile: RecommendationProfile): Job[] => {
  const scored = enrichJobsWithMatch(jobs, profile);

  return [...scored].sort((a, b) => {
    const areaMatchA = profile.area && a.area === profile.area ? 1 : 0;
    const areaMatchB = profile.area && b.area === profile.area ? 1 : 0;

    if (areaMatchB !== areaMatchA) {
      return areaMatchB - areaMatchA;
    }

    return b.matchScore.score - a.matchScore.score;
  });
};
