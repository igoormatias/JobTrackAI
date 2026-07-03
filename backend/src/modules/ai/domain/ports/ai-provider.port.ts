import type { AnalysisSnapshot } from "../entities/career-analysis.entity.js";
import type { CareerAnalysisResult } from "../entities/career-analysis.entity.js";

export type CareerAnalysisPromptInput = {
  snapshot: AnalysisSnapshot;
  model: string;
};

export type CareerAnalysisRawResult = CareerAnalysisResult & {
  promptTokens?: number;
  completionTokens?: number;
};

export interface AIProviderPort {
  readonly providerName: string;
  analyzeCareer(input: CareerAnalysisPromptInput): Promise<CareerAnalysisRawResult>;
}
