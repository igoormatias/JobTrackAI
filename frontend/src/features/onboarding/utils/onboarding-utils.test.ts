import { describe, expect, it } from "vitest";

import { createInitialFormState } from "../types/onboarding.types";
import { indexToSalaryBand, salaryBandToIndex, salaryBandToRange } from "./salary-band-mapper";
import { mergeDraftWithProfile } from "./draft-storage";

describe("salary-band-mapper", () => {
  it("maps salary band to numeric range", () => {
    expect(salaryBandToRange("8k_12k")).toEqual({ min: 8000, max: 12000, currency: "BRL" });
  });

  it("maps index to salary band", () => {
    expect(indexToSalaryBand(2)).toBe("8k_12k");
    expect(salaryBandToIndex("15k_plus")).toBe(4);
  });
});

describe("draft-storage merge", () => {
  it("prefers the most advanced saved step", () => {
    const form = createInitialFormState();
    const merged = mergeDraftWithProfile(
      "seniority",
      {
        currentStep: "salary",
        form: { ...form, area: "frontend", skills: ["React"] },
        savedAt: new Date().toISOString(),
      },
      { area: "backend" },
    );

    expect(merged.step).toBe("salary");
    expect(merged.form.area).toBe("frontend");
  });
});
