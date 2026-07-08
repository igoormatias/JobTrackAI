import { jobTitleNormalizer } from "../../../match/domain/services/job-title-normalizer.service.js";
import {
  buildJobSearchFields,
  inferTechnologiesFromText,
} from "../../../../shared/utils/job-search-fields.js";
import {
  computeDescriptionHash,
  computeJobFingerprint,
} from "../../domain/services/job-normalizer.service.js";
import type { NormalizedJob } from "../../domain/entities/normalized-job.entity.js";
import type { CatalogJobUpsertInput } from "../../../job-catalog/domain/value-objects/catalog-list-filters.js";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const toCatalogUpsertInput = (job: NormalizedJob): CatalogJobUpsertInput => {
  const description = job.description || `${job.title} na ${job.company}`;
  const technologies =
    job.technologies.length > 0
      ? job.technologies
      : inferTechnologiesFromText(`${job.title} ${description}`);
  const requirements = job.requirements ?? [];
  const benefits = job.benefits ?? [];
  const responsibilities = job.responsibilities ?? [];
  const techMeta = technologies.map((name, index) => ({
    id: `tech_${slugify(name)}_${index}`,
    name,
    slug: slugify(name),
  }));
  const searchFields = buildJobSearchFields({
    title: job.title,
    companyName: job.company,
    location: job.location,
    description,
    descriptionHtml: job.descriptionHtml ?? null,
    technologies: techMeta,
    requirements,
    benefits,
    responsibilities,
  });

  return {
    companyName: job.company,
    companySlug: slugify(job.company),
    area: job.area ?? jobTitleNormalizer.inferArea(job.title) ?? null,
    title: job.title,
    slug: slugify(`${job.title}-${job.company}-${job.externalId}`),
    description,
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
    lastCheckedAt: new Date(),
    searchText: searchFields.searchText,
    technologyText: searchFields.technologyText,
    technologySlugs: searchFields.technologySlugs,
    requirementsText: searchFields.requirementsText,
    benefitsText: searchFields.benefitsText,
    descriptionHtml: searchFields.descriptionHtml,
    metadata: {
      jobFingerprint: computeJobFingerprint({
        company: job.company,
        title: job.title,
        location: job.location,
      }),
      descriptionHash: computeDescriptionHash(description),
      technologies: techMeta,
      requirements,
      benefits,
      responsibilities,
      company: {
        id: `company_${slugify(job.company)}`,
        name: job.company,
        slug: slugify(job.company),
        logoUrl: null,
      },
    },
  };
};
