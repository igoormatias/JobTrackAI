export type RecommendationItem = {
  id: string;
  jobId: string;
  score: number;
  reasons: string[];
};

export type RecommendationList = {
  items: RecommendationItem[];
  generatedAt: string;
};
