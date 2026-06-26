import type { SalaryBand, SalaryRange } from "@/types";

import { SALARY_BAND_OPTIONS } from "../constants/salary-bands";

export const salaryBandToRange = (band: SalaryBand): SalaryRange => {
  const option = SALARY_BAND_OPTIONS.find((item) => item.value === band);

  if (!option) {
    return { min: 0, max: 0, currency: "BRL" };
  }

  return {
    min: option.min,
    max: option.max,
    currency: "BRL",
  };
};

export const salaryBandToIndex = (band: SalaryBand | ""): number => {
  if (!band) return 0;
  const index = SALARY_BAND_OPTIONS.findIndex((option) => option.value === band);
  return index >= 0 ? index : 0;
};

export const indexToSalaryBand = (index: number): SalaryBand =>
  SALARY_BAND_OPTIONS[index]?.value ?? "up_to_5k";
