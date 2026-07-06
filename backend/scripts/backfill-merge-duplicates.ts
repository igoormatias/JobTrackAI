/**
 * One-shot: merge catalog jobs that share the same fingerprint (cross-provider duplicates).
 * Creates JobAlternateSource rows and reassigns trackings to the canonical job.
 * Run: npx tsx scripts/backfill-merge-duplicates.ts
 */
import { prisma } from "../src/database/prisma.js";
import { computeJobFingerprint } from "../src/modules/job-aggregation/domain/services/job-normalizer.service.js";

type CatalogJobRow = {
  id: string;
  source: string;
  externalId: string | null;
  sourceUrl: string | null;
  contentHash: string | null;
  companyName: string;
  title: string;
  location: string | null;
  publishedAt: Date;
};

const main = async () => {
  const jobs = await prisma.job.findMany({
    where: { isCatalog: true },
    select: {
      id: true,
      source: true,
      externalId: true,
      sourceUrl: true,
      contentHash: true,
      companyName: true,
      title: true,
      location: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "asc" },
  });

  const groups = new Map<string, CatalogJobRow[]>();

  for (const job of jobs) {
    const fingerprint = computeJobFingerprint({
      company: job.companyName,
      title: job.title,
      location: job.location,
    });
    const bucket = groups.get(fingerprint) ?? [];
    bucket.push(job);
    groups.set(fingerprint, bucket);
  }

  let mergedGroups = 0;
  let alternatesCreated = 0;
  let trackingsReassigned = 0;
  let jobsDeleted = 0;

  for (const [, group] of groups) {
    if (group.length < 2) continue;

    const sources = new Set(group.map((job) => job.source));
    if (sources.size < 2) continue;

    const canonical = group[0]!;
    const duplicates = group.slice(1);

    for (const duplicate of duplicates) {
      if (!duplicate.externalId) continue;

      const existingAlternate = await prisma.jobAlternateSource.findUnique({
        where: {
          source_externalId: {
            source: duplicate.source,
            externalId: duplicate.externalId,
          },
        },
        select: { id: true },
      });

      if (!existingAlternate) {
        await prisma.jobAlternateSource.create({
          data: {
            jobId: canonical.id,
            source: duplicate.source,
            externalId: duplicate.externalId,
            sourceUrl: duplicate.sourceUrl,
            contentHash: duplicate.contentHash,
            isPrimary: false,
          },
        });
        alternatesCreated += 1;
      }

      const reassigned = await prisma.jobTracking.updateMany({
        where: { jobId: duplicate.id },
        data: { jobId: canonical.id },
      });
      trackingsReassigned += reassigned.count;

      await prisma.jobView.deleteMany({ where: { jobId: duplicate.id } });
      await prisma.job.delete({ where: { id: duplicate.id } });
      jobsDeleted += 1;
    }

    mergedGroups += 1;
  }

  console.log({
    totalCatalogJobs: jobs.length,
    mergedGroups,
    alternatesCreated,
    trackingsReassigned,
    jobsDeleted,
  });
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
