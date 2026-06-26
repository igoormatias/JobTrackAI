import { faker } from "@faker-js/faker";

import type { Profile, Skill, Technology } from "@/types";

import { TECHNOLOGIES } from "../constants/mock-data";
import { createId, slugify } from "../utils/mock-utils";

export type CreateProfileInput = {
  userId: string;
  id?: string;
  onboardingCompleted?: boolean;
};

const createTechnology = (name: string, index: number): Technology => ({
  id: createId("tech", index),
  name,
  slug: slugify(name),
});

const createSkill = (name: string, index: number): Skill => ({
  id: createId("skill", index),
  name,
  slug: slugify(name),
  level: faker.helpers.arrayElement(["basic", "intermediate", "advanced", "expert"]),
});

export const createProfile = ({
  userId,
  id,
  onboardingCompleted = true,
}: CreateProfileInput): Profile => {
  const now = new Date().toISOString();
  const techNames = faker.helpers.arrayElements([...TECHNOLOGIES], { min: 8, max: 12 });
  const avoided = faker.helpers.arrayElements(TECHNOLOGIES.filter((t) => !techNames.includes(t)), {
    min: 1,
    max: 3,
  });

  return {
    id: id ?? createId("profile", 1),
    userId,
    headline: "Desenvolvedor Full Stack | React · Node.js · TypeScript",
    area: "full_stack",
    seniority: "senior",
    modality: "remote",
    location: "São Paulo, SP",
    locationPreference: {
      scope: "city",
      city: "São Paulo",
      state: "SP",
      acceptsRelocation: false,
    },
    salaryExpectation: { min: 12000, max: 18000, currency: "BRL" },
    salaryBand: "12k_15k",
    skills: techNames.slice(0, 6).map((name, index) => createSkill(name, index + 1)),
    skillNames: techNames.slice(0, 6),
    blockedSkills: avoided,
    technologies: techNames.map((name, index) => createTechnology(name, index + 1)),
    avoidedTechnologies: avoided.map((name, index) => createTechnology(name, index + 100)),
    bio: "Profissional com experiência em produtos digitais, arquitetura frontend e integrações de APIs.",
    linkedinUrl: "https://linkedin.com/in/matias-silva",
    githubUrl: "https://github.com/matias-silva",
    onboardingProgress: onboardingCompleted
      ? { currentStep: "summary", lastSavedAt: now }
      : null,
    onboardingCompleted,
    extensions: {},
    updatedAt: now,
  };
};
