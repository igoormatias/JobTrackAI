import type { MatchScore } from "@/types/match";
import type { PipelineStage } from "@/types/application";

export type JobMatchDto = {
  matchScore: MatchScore;
  compatibilityLabel: string;
};

export type LearningGapImportance = "high" | "medium" | "low";

export type LearningGap = {
  id: string;
  name: string;
  slug: string;
  importance: LearningGapImportance;
  category: string;
};

export type JobInsightVariant = "positive" | "neutral" | "warning";

export type JobInsight = {
  id: string;
  title: string;
  description: string;
  variant: JobInsightVariant;
};

export type JobTimelineStatus = "completed" | "current" | "upcoming";

export type JobTimelineStep = {
  stage: PipelineStage;
  label: string;
  status: JobTimelineStatus;
  occurredAt?: string;
};

export type JobDescriptionSections = {
  summary: string;
  fullDescription: string;
  requirements: string[];
  desirable: string[];
  benefits: string[];
  additionalInfo: string | null;
};

export type JobDetailsCompany = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  industry: string;
  jobCount: number;
};
