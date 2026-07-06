import { prisma } from "../../../../database/prisma.js";
import type {
  DedupLookupRepository,
  ExistingJobMatch,
} from "../../domain/repositories/dedup-lookup.repository.js";
import {
  computeJobFingerprint,
  normalizeSourceUrl,
} from "../../domain/services/job-normalizer.service.js";

const jobSelect = {
  id: true,
  source: true,
  externalId: true,
  contentHash: true,
  sourceUrl: true,
  companyName: true,
  title: true,
  location: true,
} as const;

const mapJob = (record: {
  id: string;
  source: string;
  externalId: string | null;
  contentHash: string | null;
  sourceUrl: string | null;
}): ExistingJobMatch => ({
  id: record.id,
  source: record.source,
  externalId: record.externalId,
  contentHash: record.contentHash,
  sourceUrl: record.sourceUrl,
});

export class PrismaDedupLookupRepository implements DedupLookupRepository {
  async findBySourceAndExternalId(source: string, externalId: string): Promise<ExistingJobMatch | null> {
    const record = await prisma.job.findUnique({
      where: { source_externalId: { source, externalId } },
      select: { id: true, source: true, externalId: true, contentHash: true, sourceUrl: true },
    });
    return record ? mapJob(record) : null;
  }

  async findByContentHash(contentHash: string): Promise<ExistingJobMatch | null> {
    const record = await prisma.job.findFirst({
      where: { contentHash },
      select: { id: true, source: true, externalId: true, contentHash: true, sourceUrl: true },
    });
    return record ? mapJob(record) : null;
  }

  async findBySourceUrl(sourceUrl: string): Promise<ExistingJobMatch | null> {
    const normalized = normalizeSourceUrl(sourceUrl);
    const record = await prisma.job.findFirst({
      where: { sourceUrl: normalized },
      select: { id: true, source: true, externalId: true, contentHash: true, sourceUrl: true },
    });
    return record ? mapJob(record) : null;
  }

  async findByFingerprint(fingerprint: string): Promise<ExistingJobMatch | null> {
    const byMeta = await prisma.job.findFirst({
      where: {
        isCatalog: true,
        metadata: { path: ["jobFingerprint"], equals: fingerprint },
      },
      select: jobSelect,
    });
    if (byMeta) return mapJob(byMeta);

    const candidates = await prisma.job.findMany({
      where: { isCatalog: true },
      select: jobSelect,
      take: 500,
      orderBy: { publishedAt: "desc" },
    });

    for (const record of candidates) {
      const candidateFingerprint = computeJobFingerprint({
        company: record.companyName,
        title: record.title,
        location: record.location,
      });
      if (candidateFingerprint === fingerprint) {
        return mapJob(record);
      }
    }

    return null;
  }

  async findByDescriptionHash(descriptionHash: string): Promise<ExistingJobMatch | null> {
    const byMeta = await prisma.job.findFirst({
      where: {
        isCatalog: true,
        metadata: { path: ["descriptionHash"], equals: descriptionHash },
      },
      select: jobSelect,
    });
    if (byMeta) return mapJob(byMeta);

    return null;
  }

  async countCatalogJobs(): Promise<number> {
    return prisma.job.count({ where: { isCatalog: true } });
  }
}

export const prismaDedupLookupRepository = new PrismaDedupLookupRepository();
