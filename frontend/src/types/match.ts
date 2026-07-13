export type MatchReason = {
  id: string;
  label: string;
  matched: boolean;
};

export type MissingSkill = {
  id: string;
  name: string;
  slug: string;
};

export type MatchFactor = {
  id: string;
  label: string;
  weight: number;
  applicable: boolean;
  state?: "match" | "mismatch" | "unknown";
  ratio: number;
  points: number;
  matched: boolean;
  detail: string;
};

export type MatchGroup = {
  id: "technical" | "jobFit";
  label: string;
  weight: number;
  applicable: boolean;
  score: number | null;
  factorIds: string[];
};

export type MatchConfidence = {
  level: "high" | "medium" | "low";
  score: number;
  signals: string[];
};

export type SkillEvidence = {
  name: string;
  slug: string;
  present: boolean;
};

export type SkillCoverage = {
  matched: number;
  required: number;
  percent: number;
};

export type MatchEngineVersion = "rules-v1" | "rules-v2" | "rules-v3" | "rules-v4" | "rules-v5";

export type MatchScore = {
  score: number;
  label: "excellent" | "good" | "fair" | "low";
  reasons: MatchReason[];
  missingSkills: MissingSkill[];
  matchedSkills?: string[];
  factors?: MatchFactor[];
  groups?: MatchGroup[];
  skillEvidence?: SkillEvidence[];
  skillCoverage?: SkillCoverage;
  confidence?: MatchConfidence;
  engineVersion?: MatchEngineVersion;
};
