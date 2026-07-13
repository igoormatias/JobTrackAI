/**
 * Match engine weights — rules-v5 (group-based, evidence-based).
 * Groups (affinity is reasons-only, not scored):
 *   technical 60 · jobFit 25
 * Sub-weights redistribute within each group over known factors only.
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

export const MATCH_WEIGHTS_V5 = {
  groups: {
    technical: 60,
    jobFit: 25,
  },
  technical: {
    skills: 50,
    seniority: 15,
    area: 10,
  },
  jobFit: {
    modality: 10,
    salary: 10,
    location: 5,
  },
} as const;

/** Active weights — rules-v5 is the current engine. */
export const MATCH_WEIGHTS = MATCH_WEIGHTS_V5;

export const MATCH_ENGINE_VERSION = "rules-v5" as const;

/** Dashboard top-jobs filter. Score distribution changed with v5; adjust here if needed. */
export const DASHBOARD_TOP_MATCH_THRESHOLD = 70;
