/**
 * One-shot: migrate legacy user-owned jobs to global catalog (userId null, isCatalog true).
 * Run: npx tsx scripts/backfill-catalog-jobs.ts
 */
import { prisma } from "../src/database/prisma.js";

const main = async () => {
  const legacyJobs = await prisma.job.findMany({
    where: {
      OR: [{ userId: { not: null } }, { isCatalog: false }],
    },
    select: {
      id: true,
      source: true,
      externalId: true,
      userId: true,
      isCatalog: true,
    },
  });

  let migrated = 0;
  let skipped = 0;

  for (const job of legacyJobs) {
    if (job.externalId) {
      const duplicate = await prisma.job.findFirst({
        where: {
          source: job.source,
          externalId: job.externalId,
          id: { not: job.id },
          isCatalog: true,
          userId: null,
        },
        select: { id: true },
      });

      if (duplicate) {
        const trackings = await prisma.jobTracking.count({ where: { jobId: job.id } });
        if (trackings > 0) {
          await prisma.jobTracking.updateMany({
            where: { jobId: job.id },
            data: { jobId: duplicate.id },
          });
        }
        await prisma.job.delete({ where: { id: job.id } });
        migrated += 1;
        continue;
      }
    }

    await prisma.job.update({
      where: { id: job.id },
      data: { userId: null, isCatalog: true },
    });
    migrated += 1;
  }

  console.log({ total: legacyJobs.length, migrated, skipped });
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
