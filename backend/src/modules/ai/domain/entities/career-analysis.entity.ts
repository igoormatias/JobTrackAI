export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | "UNSPECIFIED";
export type SkillStatus = "OFFICIAL" | "CUSTOM";

export type SkillRecord = {
  id: string;
  slug: string;
  name: string;
  status: SkillStatus;
  area?: string | null;
};

export type UserSkillRecord = {
  skillSlug: string;
  skillName: string;
  level: SkillLevel;
  status: SkillStatus;
};

export type SnapshotSkill = {
  skillSlug: string;
  skillName: string;
};

export type CareerAnalysisResult = {
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
};

export type CareerAnalysisRecord = {
  id: string;
  trackingId: string;
  contentHash: string;
  result: CareerAnalysisResult;
  provider: string;
  model: string;
  promptVersion: string;
  matchEngineVersion: string;
  confidence: number | null;
  generatedAt: Date;
};

export type TimelineSnapshot = {
  type: string;
  title: string;
  occurredAt: string;
};

export type AnalysisMatchEvidence = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  engineVersion: string;
  skillCoverage: {
    matched: number;
    required: number;
    percent: number;
  };
  factors: Array<{
    id: string;
    label: string;
    weight: number;
    applicable: boolean;
    matched: boolean;
    detail: string;
  }>;
  skillEvidence: Array<{
    name: string;
    slug: string;
    present: boolean;
  }>;
};

export type AnalysisSnapshot = {
  job: {
    id: string;
    title: string;
    companyName: string;
    description: string;
    seniority?: string | null;
    modality?: string | null;
    technologySlugs: string[];
    requirementSlugs: string[];
  };
  profile: {
    area?: string | null;
    seniority?: string | null;
    modality?: string | null;
    location: string;
    salaryBand?: string | null;
    userSkills: SnapshotSkill[];
  };
  tracking: {
    stage: string;
    notes?: string | null;
    priority: string;
  };
  timeline: TimelineSnapshot[];
  match: AnalysisMatchEvidence;
  meta: {
    promptVersion: string;
    matchEngineVersion: string;
    model: string;
  };
};
