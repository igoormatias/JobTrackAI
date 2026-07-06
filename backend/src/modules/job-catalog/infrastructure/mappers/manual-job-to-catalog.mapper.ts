import { jobTitleNormalizer } from "../../../match/domain/services/job-title-normalizer.service.js";
import type { CreateManualJobInput } from "../../../tracking/domain/entities/job-tracking.entity.js";
import type { CatalogJobUpsertInput } from "../../domain/value-objects/catalog-list-filters.js";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const manualJobToCatalogInput = (input: CreateManualJobInput): CatalogJobUpsertInput => {
  const companySlug = slugify(input.companyName);
  const titleSlug = slugify(input.title);

  return {
    companyName: input.companyName,
    companySlug,
    area: input.area ?? jobTitleNormalizer.inferArea(input.title) ?? "other",
    title: input.title,
    slug: slugify(`${input.title}-${input.companyName}-${input.source}`),
    description: input.description ?? `${input.title} na ${input.companyName}`,
    sourceUrl: input.sourceUrl ?? null,
    source: input.source,
    externalId:
      input.sourceUrl != null && input.sourceUrl !== ""
        ? `${input.source}-${titleSlug}-${companySlug}`
        : `manual-${input.source}-${companySlug}-${titleSlug}`,
    modality: input.modality ?? null,
    location: input.location ?? null,
    isCatalog: true,
    publishedAt: new Date(),
    lastCheckedAt: new Date(),
    metadata: {
      technologies: [],
      requirements: [],
      benefits: [],
      company: {
        id: `company_${companySlug}`,
        name: input.companyName,
        slug: companySlug,
        logoUrl: null,
      },
    },
  };
};
