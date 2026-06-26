import type { SalaryBand } from "@/types";

export type SalaryBandOption = {
  value: SalaryBand;
  label: string;
  min: number;
  max: number;
};

export const SALARY_BAND_OPTIONS: SalaryBandOption[] = [
  { value: "up_to_5k", label: "Até 5k", min: 0, max: 5000 },
  { value: "5k_8k", label: "5k - 8k", min: 5000, max: 8000 },
  { value: "8k_12k", label: "8k - 12k", min: 8000, max: 12000 },
  { value: "12k_15k", label: "12k - 15k", min: 12000, max: 15000 },
  { value: "15k_plus", label: "15k+", min: 15000, max: 999999 },
];

export const getSalaryBandLabel = (band: SalaryBand | ""): string => {
  if (!band) return "";
  return SALARY_BAND_OPTIONS.find((option) => option.value === band)?.label ?? band;
};
