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
  ratio: number;
  points: number;
  matched: boolean;
  detail: string;
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

export type MatchEngineVersion = "rules-v1" | "rules-v2" | "rules-v3" | "rules-v4";

export type MatchScore = {
  score: number;
  label: "excellent" | "good" | "fair" | "low";
  reasons: MatchReason[];
  missingSkills: MissingSkill[];
  matchedSkills?: string[];
  factors?: MatchFactor[];
  skillEvidence?: SkillEvidence[];
  skillCoverage?: SkillCoverage;
  engineVersion?: MatchEngineVersion;
};
