import type { MatchResultDto } from "../../../match/domain/services/match-engine.service.js";
import type { ResumeStructuredContent } from "./resume.entity.js";

export type ResumeJobAnalysisResult = {
  summary: string;
  atsScore: number;
  atsBreakdown: {
    keywords: number;
    formatting: number;
    structure: number;
    relevance: number;
  };
  technicalCompatibility: number;
  behavioralCompatibility: number | null;
  strengths: string[];
  gaps: string[];
  missingSkills: string[];
  underusedExperiences: string[];
  improvementRanking: Array<{ title: string; impact: string; priority: number }>;
  suggestions: Array<{
    type: string;
    section: string;
    reason: string;
    impact: string;
    suggestedText: string;
  }>;
  matchScore: number;
  matchedSkillsCount: number;
  missingSkillsCount: number;
  confidence: number;
};

export type ResumeAnalysisSnapshot = {
  resume: ResumeStructuredContent;
  resumeVersionId: string;
  resumeVersionNumber: number;
  profile: {
    area?: string | null;
    seniority?: string | null;
    modality?: string | null;
    location?: string | null;
    skillNames: string[];
  };
  job: {
    title: string;
    company: string;
    description: string;
    sourceUrl: string;
    externalId: string;
    technologies: string[];
    requirements: string[];
  };
  match: MatchResultDto;
  meta: {
    promptVersion: string;
    matchEngineVersion: string;
    model: string;
  };
};

export type ResumeAnalysisRecord = {
  id: string;
  userId: string;
  resumeId: string;
  resumeVersionId: string;
  jobSourceUrl: string;
  jobExternalId: string | null;
  jobTitle: string | null;
  jobCompany: string | null;
  contentHash: string;
  result: ResumeJobAnalysisResult;
  matchScore: number;
  atsScore: number;
  provider: string;
  model: string;
  promptVersion: string;
  matchEngineVersion: string;
  generatedAt: Date;
};

export type ResumeSuggestionRecord = {
  id: string;
  analysisId: string;
  type: string;
  section: string;
  reason: string;
  impact: string;
  suggestedText: string;
  status: "pending" | "accepted" | "rejected" | "edited";
  appliedVersionId: string | null;
  createdAt: Date;
};
