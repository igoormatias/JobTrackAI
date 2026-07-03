export type ResumeExperience = {
  company: string;
  role: string;
  startDate?: string | null;
  endDate?: string | null;
  description: string;
  technologies: string[];
};

export type ResumeEducation = {
  institution: string;
  degree?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type ResumeCertification = {
  name: string;
  issuer?: string | null;
  date?: string | null;
};

export type ResumeLanguage = {
  name: string;
  level?: string | null;
};

export type ResumeProject = {
  name: string;
  description: string;
  technologies: string[];
};

export type ResumeStructuredContent = {
  fullName?: string | null;
  professionalSummary: string;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
  projects: ResumeProject[];
  softSkills: string[];
  hardSkills: string[];
};

export type ResumeVersionSource = "manual" | "paste" | "upload" | "import_ai" | "suggestion";

export type ResumeVersionRecord = {
  id: string;
  resumeId: string;
  versionNumber: number;
  content: ResumeStructuredContent;
  contentHash: string;
  source: ResumeVersionSource;
  createdAt: Date;
};

export type ResumeRecord = {
  id: string;
  userId: string;
  currentVersionId: string | null;
  currentVersion: ResumeVersionRecord | null;
  createdAt: Date;
  updatedAt: Date;
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
