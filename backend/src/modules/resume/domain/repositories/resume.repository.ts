import type {
  ResumeAnalysisRecord,
  ResumeAnalysisSnapshot,
  ResumeJobAnalysisResult,
  ResumeSuggestionRecord,
} from "../entities/resume-analysis.entity.js";
import type {
  ResumeRecord,
  ResumeStructuredContent,
  ResumeVersionRecord,
  ResumeVersionSource,
} from "../entities/resume.entity.js";

export type CreateResumeVersionInput = {
  resumeId: string;
  content: ResumeStructuredContent;
  contentHash: string;
  source: ResumeVersionSource;
};

export type ResumeImportLogInput = {
  userId: string;
  format: string;
  status: string;
  rawTextLength: number;
  fileHash?: string | null;
  errorMessage?: string | null;
  versionId?: string | null;
};

export interface ResumeRepository {
  findByUserId(userId: string): Promise<ResumeRecord | null>;
  ensureForUser(userId: string): Promise<ResumeRecord>;
  createVersion(input: CreateResumeVersionInput): Promise<ResumeVersionRecord>;
  setCurrentVersion(resumeId: string, versionId: string): Promise<ResumeRecord>;
  listVersions(resumeId: string): Promise<ResumeVersionRecord[]>;
  findVersionById(versionId: string, userId: string): Promise<ResumeVersionRecord | null>;
  logImport(input: ResumeImportLogInput): Promise<void>;
  findAnalysisByHash(userId: string, contentHash: string): Promise<ResumeAnalysisRecord | null>;
  saveAnalysis(input: {
    userId: string;
    resumeId: string;
    resumeVersionId: string;
    jobSourceUrl: string;
    jobExternalId?: string | null;
    jobTitle?: string | null;
    jobCompany?: string | null;
    contentHash: string;
    result: ResumeJobAnalysisResult;
    matchScore: number;
    atsScore: number;
    provider: string;
    model: string;
    promptVersion: string;
    matchEngineVersion: string;
  }): Promise<ResumeAnalysisRecord>;
  saveSuggestions(
    analysisId: string,
    suggestions: ResumeJobAnalysisResult["suggestions"],
  ): Promise<ResumeSuggestionRecord[]>;
  findAnalysisById(analysisId: string, userId: string): Promise<ResumeAnalysisRecord | null>;
  listSuggestions(analysisId: string): Promise<ResumeSuggestionRecord[]>;
  findSuggestionById(suggestionId: string, userId: string): Promise<ResumeSuggestionRecord | null>;
  updateSuggestionStatus(
    suggestionId: string,
    status: ResumeSuggestionRecord["status"],
    appliedVersionId?: string | null,
  ): Promise<ResumeSuggestionRecord>;
  listHistory(userId: string, limit: number): Promise<{
    analyses: ResumeAnalysisRecord[];
    imports: Array<{ id: string; format: string; status: string; createdAt: Date }>;
  }>;
  logUsage(input: {
    userId: string;
    analysisId?: string | null;
    wasCached: boolean;
    durationMs?: number | null;
    model?: string | null;
    promptTokens?: number | null;
    completionTokens?: number | null;
  }): Promise<void>;
  countRealUsageSince(userId: string, since: Date): Promise<number>;
  findLastRealUsageAt(userId: string): Promise<Date | null>;
}

export type { ResumeAnalysisSnapshot };
