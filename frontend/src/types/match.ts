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

export type MatchScore = {
  score: number;
  label: "excellent" | "good" | "fair" | "low";
  reasons: MatchReason[];
  missingSkills: MissingSkill[];
};
