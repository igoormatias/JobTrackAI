/**
 * Match engine weights — rules-v3 (sprint refinements).
 * Primary relevance mix (sums to 100 for core dimensions):
 *   skills 45 · title/role 20 · area 15 · seniority 10 · modality 5 · location 5
 * Soft boosts (capped) for salary, favorite companies and pipeline history.
 */
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
  areaIncompatibleScoreCap: 30,
} as const;

export const MATCH_WEIGHTS_V3 = {
  skillsMax: 45,
  titleRoleMax: 20,
  areaMax: 15,
  seniorityMax: 10,
  modalityMax: 5,
  locationMax: 5,
  salaryBoost: 3,
  favoriteCompanyBoost: 3,
  pipelineHistoryBoost: 3,
  savedHistoryBoost: 2,
  viewedHistoryBoost: 1,
  areaIncompatibleScoreCap: 35,
  seniorityMismatchPenalty: -8,
} as const;

/** Active weights — rules-v3 is the current engine. */
export const MATCH_WEIGHTS = MATCH_WEIGHTS_V3;

export const MATCH_ENGINE_VERSION = "rules-v3" as const;

export const DASHBOARD_TOP_MATCH_THRESHOLD = 70;
