/**
 * Match engine weights — rules-v4 (evidence-based).
 * Core dimensions (sums to 100):
 *   skills 50 · seniority 15 · modality 10 · location 10 · salary 10 · area 5
 * Score is normalized over applicable factors only (missing data does not penalize).
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

export const MATCH_WEIGHTS_V4 = {
  skills: 50,
  seniority: 15,
  modality: 10,
  location: 10,
  salary: 10,
  area: 5,
} as const;

/** Active weights — rules-v4 is the current engine. */
export const MATCH_WEIGHTS = MATCH_WEIGHTS_V4;

export const MATCH_ENGINE_VERSION = "rules-v4" as const;

/** Dashboard top-jobs filter. Score distribution changed with v4; adjust here if needed. */
export const DASHBOARD_TOP_MATCH_THRESHOLD = 70;
