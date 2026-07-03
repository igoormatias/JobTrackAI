export const AI_CAREER_ENGINE_VERSION = "ai-career-v1" as const;

export type CareerAnalysisResponseDto = {
  summary: string;
  matchExplanation: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  learningRecommendations: string[];
  interviewPreparation: string[];
  careerInsights: string[];
  nextSteps: string[];
  confidence: number;
  generatedAt: string;
  provider: string;
  model: string;
  engineVersion: typeof AI_CAREER_ENGINE_VERSION;
  matchEngineVersion: string;
  cached: boolean;
  stale?: boolean;
};

export type CareerAnalysisApiResponse = {
  data: CareerAnalysisResponseDto;
};
