import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GUPY_SEED_PATTERN = /^gupy_job_\d+$/;

async function main(): Promise<void> {
  const gupySeedJobs = await prisma.job.findMany({
    where: {
      source: "gupy",
      isCatalog: true,
      externalId: { not: null },
    },
    select: { id: true, externalId: true, sourceUrl: true },
  });

  const toFix = gupySeedJobs.filter((job) => job.externalId && GUPY_SEED_PATTERN.test(job.externalId));

  if (toFix.length === 0) {
    console.log("No seeded Gupy URLs to fix.");
    return;
  }

  let fixed = 0;
  const batchSize = 25;

  for (let i = 0; i < toFix.length; i += batchSize) {
    const batch = toFix.slice(i, i + batchSize);
    await prisma.$transaction(
      batch.map((job) => {
        const match = job.externalId!.match(/(\d+)$/);
        const index = match ? Number(match[1]) : 0;
        const numericId = String(10_000 + index);
        const sourceUrl = `https://portal.gupy.io/job/${numericId}`;

        return prisma.job.update({
          where: { id: job.id },
          data: {
            externalId: numericId,
            sourceUrl,
          },
        });
      }),
    );
    fixed += batch.length;
  }

  console.log(`Fixed ${fixed} Gupy seeded job URLs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
