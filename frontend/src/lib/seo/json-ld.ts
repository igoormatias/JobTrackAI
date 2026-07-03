import type { Job } from "@/types";

import { metadataBase, siteConfig } from "./site-config";

type JsonLd = Record<string, unknown>;

const absoluteUrl = (path: string): string => new URL(path, metadataBase).toString();

export const buildOrganizationJsonLd = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: absoluteUrl(siteConfig.logo),
  description: siteConfig.description,
});

export const buildWebsiteJsonLd = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: "pt-BR",
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
    logo: absoluteUrl(siteConfig.logo),
  },
});

const mapEmploymentType = (employmentType?: Job["employmentType"]): string | undefined => {
  switch (employmentType) {
    case "clt":
      return "FULL_TIME";
    case "pj":
      return "CONTRACTOR";
    case "contract":
      return "CONTRACTOR";
    case "internship":
      return "INTERN";
    default:
      return undefined;
  }
};

const mapWorkModality = (modality: Job["modality"]): string => {
  switch (modality) {
    case "remote":
    case "hybrid":
      return "TELECOMMUTE";
    default:
      return "ON_SITE";
  }
};

export const buildJobPostingJsonLd = (job: Job): JsonLd => {
  const employmentType = mapEmploymentType(job.employmentType);
  const jobLocationType = mapWorkModality(job.modality);

  const basePosting: JsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: siteConfig.name,
      value: job.id,
    },
    datePosted: job.publishedAt,
    validThrough: job.updatedAt,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
      ...(job.company.logoUrl ? { logo: job.company.logoUrl } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: "BR",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Brasil",
    },
    jobLocationType,
    url: absoluteUrl(`/jobs/${job.id}`),
    directApply: false,
  };

  if (employmentType) {
    basePosting.employmentType = employmentType;
  }

  if (job.salaryMin !== null || job.salaryMax !== null) {
    basePosting.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.currency,
      value: {
        "@type": "QuantitativeValue",
        ...(job.salaryMin !== null ? { minValue: job.salaryMin } : {}),
        ...(job.salaryMax !== null ? { maxValue: job.salaryMax } : {}),
        unitText: "MONTH",
      },
    };
  }

  return basePosting;
};
