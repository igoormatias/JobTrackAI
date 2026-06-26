import { faker } from "@faker-js/faker";

import type { MatchScore } from "@/types";

import { MATCH_REASONS, MISSING_SKILLS } from "../constants/mock-data";
import { createId, slugify } from "../utils/mock-utils";

export type CreateMatchInput = {
  score?: number;
};

const getMatchLabel = (score: number): MatchScore["label"] => {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  return "low";
};

export const createMatchScore = ({ score }: CreateMatchInput = {}): MatchScore => {
  const finalScore = score ?? faker.number.int({ min: 55, max: 98 });
  const reasonCount = faker.number.int({ min: 3, max: 5 });
  const missingCount = faker.number.int({ min: 1, max: 3 });

  return {
    score: finalScore,
    label: getMatchLabel(finalScore),
    reasons: faker.helpers.arrayElements([...MATCH_REASONS], reasonCount).map((label, index) => ({
      id: createId("reason", index + 1),
      label,
      matched: true,
    })),
    missingSkills: faker.helpers.arrayElements([...MISSING_SKILLS], missingCount).map((name, index) => ({
      id: createId("missing", index + 1),
      name,
      slug: slugify(name),
    })),
  };
};
