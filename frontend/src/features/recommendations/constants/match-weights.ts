import type { MatchWeights } from "../types/recommendation.types";

export const MATCH_WEIGHTS: MatchWeights = {
  skillMatch: 15,
  modalityMatch: 10,
  locationMatch: 10,
  salaryMatch: 10,
  seniorityMismatchPenalty: -25,
  baseScore: 50,
};
