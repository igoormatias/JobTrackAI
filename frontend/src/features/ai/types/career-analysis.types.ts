export type CareerAnalysisResponse = {
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
  engineVersion: "ai-career-v1";
  matchEngineVersion: string;
  cached: boolean;
  stale?: boolean;
};
