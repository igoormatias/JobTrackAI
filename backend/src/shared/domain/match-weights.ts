export const MATCH_WEIGHTS = {
  skillMatch: 15,
  modalityMatch: 10,
  locationMatch: 10,
  salaryMatch: 10,
  seniorityMismatchPenalty: -25,
  baseScore: 50,
} as const;

export const MATCH_ENGINE_VERSION = "rules-v1" as const;
