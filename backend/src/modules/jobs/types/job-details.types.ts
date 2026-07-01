export type JobMatchDto = {
  matchScore: {
    score: number;
    label: "excellent" | "good" | "fair" | "low";
    reasons: { id: string; label: string; matched: boolean }[];
    missingSkills: { id: string; name: string }[];
  };
  compatibilityLabel: string;
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
