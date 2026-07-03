export const MATCH_WEIGHTS_V1 = {
  skillMatch: 15,
  modalityMatch: 10,
  locationMatch: 10,
  salaryMatch: 10,
  seniorityMismatchPenalty: -25,
  baseScore: 50,
} as const;

export const MATCH_WEIGHTS_V2 = {
  baseScore: 20,
  areaMatch: 35,
  titleAreaMatch: 25,
  requiredSkillMatch: 10,
  desiredSkillMatch: 6,
  seniorityMatch: 8,
  seniorityMismatchPenalty: -12,
  modalityMatch: 6,
  locationMatch: 5,
  salaryMatch: 4,
  /** Maximum score when profile area conflicts with job area and inferred title area. */
  areaIncompatibleScoreCap: 30,
} as const;

/** Active weights — rules-v2 is the current engine. */
export const MATCH_WEIGHTS = MATCH_WEIGHTS_V2;

export const MATCH_ENGINE_VERSION = "rules-v2" as const;
