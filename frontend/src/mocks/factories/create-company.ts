import { faker } from "@faker-js/faker";

import type { Company, CompanySize } from "@/types";

import { slugify, createId } from "../utils/mock-utils";

export type CreateCompanyInput = {
  index: number;
  name: string;
  industry: string;
  location: string;
  size?: CompanySize;
};

export const createCompany = ({
  index,
  name,
  industry,
  location,
  size,
}: CreateCompanyInput): Company => ({
  id: createId("company", index),
  name,
  slug: slugify(name),
  logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
  website: `https://${slugify(name)}.com.br`,
  industry,
  size: size ?? faker.helpers.arrayElement(["startup", "small", "medium", "large", "enterprise"]),
  location,
  jobCount: 0,
});
