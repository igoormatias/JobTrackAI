import type { NormalizedJob } from "../../domain/entities/normalized-job.entity.js";
import type { CatalogJobUpsertInput } from "../../../job-catalog/domain/value-objects/catalog-list-filters.js";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const toCatalogUpsertInput = (job: NormalizedJob): CatalogJobUpsertInput => ({
  companyName: job.company,
  companySlug: slugify(job.company),
  title: job.title,
  slug: slugify(`${job.title}-${job.company}-${job.externalId}`),
  description: job.description || `${job.title} na ${job.company}`,
  sourceUrl: job.sourceUrl,
  source: job.provider,
  externalId: job.externalId,
  contentHash: job.contentHash,
  seniority: job.seniority ?? null,
  modality: job.modality ?? null,
  location: job.location ?? null,
  salaryMin: job.salaryMin ?? null,
  salaryMax: job.salaryMax ?? null,
  isCatalog: true,
  publishedAt: job.publishedAt,
  metadata: {
    technologies: job.technologies.map((name, index) => ({
      id: `tech_${slugify(name)}_${index}`,
      name,
      slug: slugify(name),
    })),
    requirements: [],
    benefits: [],
    company: {
      id: `company_${slugify(job.company)}`,
      name: job.company,
      slug: slugify(job.company),
      logoUrl: null,
    },
  },
});
