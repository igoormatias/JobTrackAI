import type { Job } from "@/types/job";
import type { MatchScore } from "@/types/match";

import { computeMatchScore, getMatchLabel } from "@/features/recommendations/utils/match-score";
import type { RecommendationProfile } from "@/features/recommendations/types/recommendation.types";

import { createId, slugify } from "../utils/mock-utils";

export type CreateMatchInput = {
  score?: number;
  job?: Job;
  profile?: RecommendationProfile;
};

export { getMatchLabel };

export const createMatchScore = ({ score, job, profile }: CreateMatchInput = {}): MatchScore => {
  if (job && profile) {
    return computeMatchScore(job, profile);
  }

  if (score !== undefined) {
    return {
      score,
      label: getMatchLabel(score),
      reasons: [],
      missingSkills: [],
    };
  }

  const fallbackScore = 70;

  return {
    score: fallbackScore,
    label: getMatchLabel(fallbackScore),
    reasons: [
      { id: createId("reason", 1), label: "Stack principal", matched: true },
      { id: createId("reason", 2), label: "Remoto", matched: true },
    ],
    missingSkills: [
      { id: createId("missing", 1), name: "Docker", slug: slugify("Docker") },
    ],
  };
};
