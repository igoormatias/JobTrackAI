/**
 * One-shot: refresh Gupy sourceUrl from provider API for catalog jobs still on portal URLs.
 * Run: npx tsx scripts/backfill-gupy-source-urls.ts
 */
import { prisma } from "../src/database/prisma.js";
import { GUPY_HEADERS } from "../src/providers/gupy/gupy.constants.js";
import type { GupyRawJob } from "../src/providers/gupy/gupy.types.js";
import { isGupyPortalUrl } from "../src/shared/utils/source-url-merge.utils.js";
import { normalizeSourceUrl } from "../src/modules/job-aggregation/domain/services/job-normalizer.service.js";

const GUPY_API = "https://employability-portal.gupy.io/api/v1/jobs";

const fetchJob = async (externalId: string): Promise<GupyRawJob | null> => {
  const response = await fetch(`${GUPY_API}/${externalId}`, { headers: GUPY_HEADERS });
  if (!response.ok) return null;
  return (await response.json()) as GupyRawJob;
};

const main = async () => {
  const jobs = await prisma.job.findMany({
    where: {
      source: "gupy",
      isCatalog: true,
      sourceUrl: { not: null },
    },
    select: { id: true, externalId: true, sourceUrl: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const job of jobs) {
    if (!job.sourceUrl || !isGupyPortalUrl(job.sourceUrl)) {
      skipped += 1;
      continue;
    }
    if (!job.externalId) {
      skipped += 1;
      continue;
    }

    const raw = await fetchJob(job.externalId);
    if (!raw?.jobUrl?.trim()) {
      skipped += 1;
      continue;
    }

    const nextUrl = normalizeSourceUrl(raw.jobUrl);
    if (nextUrl === job.sourceUrl || isGupyPortalUrl(nextUrl)) {
      skipped += 1;
      continue;
    }

    await prisma.job.update({
      where: { id: job.id },
      data: { sourceUrl: nextUrl },
    });
    updated += 1;
    console.log(`Updated ${job.id}: ${nextUrl}`);
  }

  console.log(`Done. Updated=${updated} Skipped=${skipped}`);
};

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
