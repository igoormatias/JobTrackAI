import type { Prisma } from "@prisma/client";

export type JobTechnologyMetadata = {
  id?: string;
  name: string;
  slug: string;
};

export type JobCompanyMetadata = {
  id?: string;
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  industry?: string;
};

export type JobMetadata = {
  technologies?: JobTechnologyMetadata[];
  requirements?: string[];
  benefits?: string[];
  company?: JobCompanyMetadata;
};

export const parseJobMetadata = (metadata: Prisma.JsonValue | null): JobMetadata => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata as JobMetadata;
};
