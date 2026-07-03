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

export type MatchEngineVersion = "rules-v1" | "rules-v2";

export type MatchScore = {
  score: number;
  label: "excellent" | "good" | "fair" | "low";
  reasons: MatchReason[];
  missingSkills: MissingSkill[];
  matchedSkills?: string[];
  engineVersion?: MatchEngineVersion;
};
