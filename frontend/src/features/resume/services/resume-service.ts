import { apiClient } from "@/lib/api-client";

export type ResumeExperience = {
  company: string;
  role: string;
  startDate?: string | null;
  endDate?: string | null;
  description: string;
  technologies: string[];
};

export type ResumeStructuredContent = {
  fullName?: string | null;
  professionalSummary: string;
  experiences: ResumeExperience[];
  education: Array<{
    institution: string;
    degree?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }>;
  certifications: Array<{ name: string; issuer?: string | null; date?: string | null }>;
  languages: Array<{ name: string; level?: string | null }>;
  projects: Array<{ name: string; description: string; technologies: string[] }>;
  softSkills: string[];
  hardSkills: string[];
};

export type ResumeVersion = {
  id: string;
  resumeId: string;
  versionNumber: number;
  content: ResumeStructuredContent;
  contentHash: string;
  source: string;
  createdAt: string;
};

export type ResumeData = {
  id: string;
  userId: string;
  currentVersionId: string | null;
  currentVersion: ResumeVersion | null;
  createdAt: string;
  updatedAt: string;
};

export type ResumeSuggestion = {
  id: string;
  analysisId: string;
  type: string;
  section: string;
  reason: string;
  impact: string;
  suggestedText: string;
  status: "pending" | "accepted" | "rejected" | "edited";
  appliedVersionId: string | null;
  createdAt: string;
};

export type ResumeJobAnalysis = {
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

export const EMPTY_RESUME_CONTENT: ResumeStructuredContent = {
  professionalSummary: "",
  experiences: [],
  education: [],
  certifications: [],
  languages: [],
  projects: [],
  softSkills: [],
  hardSkills: [],
};

export const fetchResume = async (): Promise<ResumeData> => {
  const response = await apiClient.get<{ data: ResumeData }>("/resume");
  return response.data.data;
};

export const updateResume = async (content: ResumeStructuredContent): Promise<ResumeData> => {
  const response = await apiClient.put<{ data: ResumeData }>("/resume", {
    content,
    source: "manual",
  });
  return response.data.data;
};

export const uploadResumeFile = async (file: File): Promise<ResumeData> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<{ data: ResumeData }>("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const importResumeText = async (text: string): Promise<ResumeData> => {
  const response = await apiClient.post<{ data: ResumeData }>("/resume/import/text", { text });
  return response.data.data;
};

export const fetchResumeVersions = async (): Promise<ResumeVersion[]> => {
  const response = await apiClient.get<{ data: ResumeVersion[] }>("/resume/versions");
  return response.data.data;
};

export const restoreResumeVersion = async (versionId: string): Promise<ResumeData> => {
  const response = await apiClient.post<{ data: ResumeData }>(`/resume/versions/${versionId}/restore`);
  return response.data.data;
};

export const analyzeResumeJob = async (url: string) => {
  const response = await apiClient.post<{
    data: {
      analysisId: string;
      analysis: ResumeJobAnalysis;
      suggestions: ResumeSuggestion[];
      resumeVersionId: string;
      cached: boolean;
    };
  }>("/resume/analyze-job", { url });
  return response.data.data;
};

export const fetchResumeHistory = async () => {
  const response = await apiClient.get<{
    data: {
      analyses: Array<{
        id: string;
        jobTitle: string | null;
        jobCompany: string | null;
        jobSourceUrl: string;
        matchScore: number;
        atsScore: number;
        generatedAt: string;
      }>;
      imports: Array<{ id: string; format: string; status: string; createdAt: string }>;
    };
  }>("/resume/history");
  return response.data.data;
};

export const applyResumeSuggestion = async (suggestionId: string, editedText?: string) => {
  const response = await apiClient.post<{ data: { resume: ResumeData } }>(
    `/resume/suggestions/${suggestionId}/apply`,
    editedText ? { editedText } : {},
  );
  return response.data.data;
};

export const rejectResumeSuggestion = async (suggestionId: string) => {
  await apiClient.post(`/resume/suggestions/${suggestionId}/reject`);
};

export const formatResumeAsText = (content: ResumeStructuredContent): string => {
  const lines: string[] = [];
  if (content.fullName) lines.push(content.fullName, "");
  if (content.professionalSummary) {
    lines.push("RESUMO PROFISSIONAL", content.professionalSummary, "");
  }
  if (content.experiences.length) {
    lines.push("EXPERIÊNCIAS");
    content.experiences.forEach((exp) => {
      lines.push(`${exp.role} — ${exp.company}`);
      if (exp.description) lines.push(exp.description);
      if (exp.technologies.length) lines.push(`Tech: ${exp.technologies.join(", ")}`);
      lines.push("");
    });
  }
  if (content.hardSkills.length) {
    lines.push("SKILLS", content.hardSkills.join(", "));
  }
  return lines.join("\n").trim();
};
