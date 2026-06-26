import { faker } from "@faker-js/faker";
import { subDays } from "date-fns";

import type { Company, Job, JobSource, ProfessionalArea, Technology } from "@/types";

import {
  JOB_TITLES_BY_AREA,
  MODALITIES,
  PROFESSIONAL_AREAS,
  SENIORITIES,
  TECHNOLOGIES,
} from "../constants/mock-data";
import { createId, slugify } from "../utils/mock-utils";
import { createMatchScore } from "./create-match";

export type CreateJobInput = {
  index: number;
  company: Company;
  area?: ProfessionalArea;
  isFavorite?: boolean;
  matchScore?: number;
};

const createJobTechnology = (name: string, index: number): Technology => ({
  id: createId("jobtech", index),
  name,
  slug: slugify(name),
});

export const createJob = ({
  index,
  company,
  area,
  isFavorite = false,
  matchScore,
}: CreateJobInput): Job => {
  const jobArea = area ?? faker.helpers.arrayElement([...PROFESSIONAL_AREAS]);
  const title = faker.helpers.arrayElement(JOB_TITLES_BY_AREA[jobArea]);
  const seniority = faker.helpers.arrayElement([...SENIORITIES]);
  const modality = faker.helpers.arrayElement([...MODALITIES]);
  const techNames = faker.helpers.arrayElements([...TECHNOLOGIES], { min: 4, max: 8 });
  const publishedAt = subDays(new Date(), faker.number.int({ min: 1, max: 45 })).toISOString();
  const now = new Date().toISOString();
  const salaryMin = faker.number.int({ min: 6000, max: 14000 });
  const salaryMax = salaryMin + faker.number.int({ min: 2000, max: 8000 });
  const source: JobSource = faker.helpers.arrayElement(["gupy", "linkedin", "programathor"]);

  return {
    id: createId("job", index),
    title,
    slug: slugify(`${title}-${company.slug}-${index}`),
    companyId: company.id,
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logoUrl: company.logoUrl,
    },
    area: jobArea,
    seniority,
    modality,
    location: company.location,
    salaryMin,
    salaryMax,
    currency: "BRL",
    description: faker.lorem.paragraphs({ min: 2, max: 4 }),
    requirements: faker.helpers.arrayElements(
      [
        "Experiência com desenvolvimento de software",
        "Conhecimento em metodologias ágeis",
        "Boa comunicação",
        "Trabalho em equipe",
        "Inglês intermediário",
      ],
      { min: 3, max: 5 },
    ),
    benefits: faker.helpers.arrayElements(
      ["Vale refeição", "Plano de saúde", "Home office", "PLR", "Gympass", "Day off aniversário"],
      { min: 3, max: 5 },
    ),
    technologies: techNames.map((name, techIndex) => createJobTechnology(name, index * 10 + techIndex)),
    source,
    sourceUrl: `https://${source}.com.br/vagas/${index}`,
    status: "active",
    isFavorite,
    matchScore: createMatchScore({ score: matchScore }),
    publishedAt,
    createdAt: publishedAt,
    updatedAt: now,
  };
};
