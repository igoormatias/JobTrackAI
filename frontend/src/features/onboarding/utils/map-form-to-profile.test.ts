import { describe, expect, it } from "vitest";

import type { Profile } from "@/types";

import { mapProfileToForm, resolveProfileSkills } from "./map-form-to-profile";

const createProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: "profile_1",
  userId: "user_1",
  headline: "",
  area: "frontend",
  seniority: null,
  modality: null,
  location: "",
  locationPreference: null,
  salaryExpectation: null,
  salaryBand: null,
  skills: [],
  skillNames: [],
  blockedSkills: [],
  technologies: [],
  avoidedTechnologies: [],
  bio: "",
  linkedinUrl: null,
  githubUrl: null,
  onboardingProgress: { currentStep: "skills", lastSavedAt: new Date().toISOString() },
  onboardingCompleted: false,
  extensions: {},
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("resolveProfileSkills", () => {
  it("prefers skillNames when present", () => {
    expect(
      resolveProfileSkills({
        skillNames: ["React", "TypeScript"],
        skills: [{ id: "1", name: "Vue", slug: "vue", level: "advanced" }],
      }),
    ).toEqual(["React", "TypeScript"]);
  });

  it("falls back to skills relation when skillNames is empty", () => {
    expect(
      resolveProfileSkills({
        skillNames: [],
        skills: [{ id: "1", name: "React", slug: "react", level: "advanced" }],
      }),
    ).toEqual(["React"]);
  });

  it("returns empty array when skills data is missing from API", () => {
    expect(
      resolveProfileSkills({
        skillNames: undefined as unknown as string[],
        skills: undefined as unknown as Profile["skills"],
      }),
    ).toEqual([]);
  });
});

describe("mapProfileToForm", () => {
  it("maps partial backend profile without crashing on refresh", () => {
    const profile = createProfile({
      skillNames: [],
      skills: undefined,
      blockedSkills: undefined,
    });

    expect(mapProfileToForm(profile as Profile)).toMatchObject({
      area: "frontend",
      skills: [],
      blockedSkills: [],
    });
  });
});
