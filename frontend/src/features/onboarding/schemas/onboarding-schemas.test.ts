import { describe, expect, it } from "vitest";

import { createInitialFormState } from "../types/onboarding.types";
import {
  areaStepSchema,
  blockedSkillsStepSchema,
  locationStepSchema,
  modalityStepSchema,
  onboardingFormSchema,
  salaryStepSchema,
  seniorityStepSchema,
  skillsStepSchema,
} from "./onboarding-schemas";

describe("onboarding schemas", () => {
  it("validates area step", () => {
    expect(areaStepSchema.safeParse({ area: "frontend" }).success).toBe(true);
    expect(areaStepSchema.safeParse({ area: "" }).success).toBe(false);
  });

  it("validates skills step", () => {
    expect(skillsStepSchema.safeParse({ skills: ["React"] }).success).toBe(true);
    expect(skillsStepSchema.safeParse({ skills: [] }).success).toBe(false);
  });

  it("validates seniority and modality steps", () => {
    expect(seniorityStepSchema.safeParse({ seniority: "mid" }).success).toBe(true);
    expect(modalityStepSchema.safeParse({ modality: "any" }).success).toBe(true);
  });

  it("validates location step with conditional fields", () => {
    expect(
      locationStepSchema.safeParse({
        locationPreference: { scope: "country", acceptsRelocation: false },
      }).success,
    ).toBe(true);

    expect(
      locationStepSchema.safeParse({
        locationPreference: { scope: "state", acceptsRelocation: true },
      }).success,
    ).toBe(false);
  });

  it("validates salary and blocked skills steps", () => {
    expect(salaryStepSchema.safeParse({ salaryBand: "8k_12k" }).success).toBe(true);
    expect(blockedSkillsStepSchema.safeParse({ blockedSkills: [] }).success).toBe(true);
  });

  it("validates complete onboarding form", () => {
    const form = {
      ...createInitialFormState(),
      area: "frontend" as const,
      skills: ["React"],
      seniority: "senior" as const,
      modality: "remote" as const,
      salaryBand: "8k_12k" as const,
    };

    expect(onboardingFormSchema.safeParse(form).success).toBe(true);
  });
});
