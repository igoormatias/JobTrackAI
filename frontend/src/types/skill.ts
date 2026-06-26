export type SkillLevel = "basic" | "intermediate" | "advanced" | "expert";

export type Skill = {
  id: string;
  name: string;
  slug: string;
  level: SkillLevel;
};
