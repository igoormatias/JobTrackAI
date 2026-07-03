import { PrismaClient } from "@prisma/client";

import { CATALOG_SEED_SKIP_THRESHOLD } from "./seeders/catalog-data.js";
import { buildCatalogJobs } from "./seeders/catalog-jobs.seeder.js";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const seedCatalog = process.env.SEED_CATALOG === "true";
  const force = process.env.SEED_FORCE === "true";

  if (!seedCatalog && !force) {
    console.log("SEED_CATALOG=false — skipping catalog seed. Use SEED_CATALOG=true for dev fallback.");
    return;
  }

  const existing = await prisma.job.count({ where: { isCatalog: true } });

  if (!force && existing >= CATALOG_SEED_SKIP_THRESHOLD) {
    console.log(`Catalog already seeded (${existing} jobs). Skipping. Set SEED_FORCE=true to recreate.`);
    return;
  }

  await prisma.job.deleteMany({ where: { isCatalog: true } });

  const jobs = buildCatalogJobs();
  await prisma.job.createMany({ data: jobs, skipDuplicates: true });
  console.log(`Seeded ${jobs.length} catalog jobs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
