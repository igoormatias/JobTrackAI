import type { Job } from "@/types/job";

export const sortJobsByMatchAndDate = (jobs: Job[]): Job[] =>
  [...jobs].sort((a, b) => {
    const scoreDiff = b.matchScore.score - a.matchScore.score;
    if (scoreDiff !== 0) return scoreDiff;

    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
