import { describe, expect, it } from "vitest";

import { AREAS, CATALOG_JOB_COUNT, SENIORITIES } from "../../../../prisma/seeders/catalog-data.js";
import { buildCatalogJobs } from "../../../../prisma/seeders/catalog-jobs.seeder.js";

describe("catalog-jobs seeder", () => {
  it("builds the official catalog size", () => {
    const jobs = buildCatalogJobs();
    expect(jobs).toHaveLength(CATALOG_JOB_COUNT);
  });

  it("distributes jobs across areas and seniorities", () => {
    const jobs = buildCatalogJobs();
    const areas = new Set(jobs.map((job) => job.area));
    const seniorities = new Set(jobs.map((job) => job.seniority));

    for (const area of AREAS) {
      expect(areas.has(area)).toBe(true);
    }

    for (const seniority of SENIORITIES) {
      expect(seniorities.has(seniority)).toBe(true);
    }
  });

  it("sets externalId for provider dedup", () => {
    const jobs = buildCatalogJobs();
    expect(jobs[0]?.externalId).toMatch(/^gupy_job_/);
    expect(jobs[0]?.isCatalog).toBe(true);
  });
});
