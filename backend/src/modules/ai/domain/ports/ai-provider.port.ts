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

export type ResumeStructurePromptInput = {
  rawText: string;
  model: string;
};

export type ResumeJobAnalysisPromptInput = {
  snapshot: unknown;
  model: string;
};

export type ResumeStructureRawResult = {
  rawJson: string;
  promptTokens?: number;
  completionTokens?: number;
};

export type ResumeJobAnalysisRawResult = {
  rawJson: string;
  promptTokens?: number;
  completionTokens?: number;
};

export interface AIProviderPort {
  readonly providerName: string;
  analyzeCareer(input: CareerAnalysisPromptInput): Promise<CareerAnalysisRawResult>;
  analyzeResumeStructure(input: ResumeStructurePromptInput): Promise<ResumeStructureRawResult>;
  analyzeResumeForJob(input: ResumeJobAnalysisPromptInput): Promise<ResumeJobAnalysisRawResult>;
}
