import type { MatchScore } from "./job.types.js";

export type JobMatchDto = {
  matchScore: MatchScore;
  compatibilityLabel: string;
  engineVersion?: string;
};

export type LearningGap = {
  id: string;
  name: string;
  slug: string;
  importance: "high" | "medium" | "low";
  category: string;
};

export type JobInsight = {
  id: string;
  title: string;
  description: string;
  variant: "positive" | "neutral" | "warning";
};

export type JobTimelineStep = {
  stage: string;
  label: string;
  status: "completed" | "current" | "upcoming";
  occurredAt?: string;
};
