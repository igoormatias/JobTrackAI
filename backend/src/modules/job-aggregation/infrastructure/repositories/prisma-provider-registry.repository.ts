import { prisma } from "../../../../database/prisma.js";
import type { JobProviderRegistryEntry } from "../../domain/entities/job-provider-registry.entity.js";
import type { ProviderRegistryRepository } from "../../domain/repositories/provider-registry.repository.js";

const mapRegistry = (record: {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  lastHealthAt: Date | null;
  lastRunAt: Date | null;
  config: unknown;
}): JobProviderRegistryEntry => ({
  id: record.id,
  name: record.name,
  displayName: record.displayName,
  enabled: record.enabled,
  lastHealthAt: record.lastHealthAt,
  lastRunAt: record.lastRunAt,
  config: (record.config as Record<string, unknown> | null) ?? null,
});

export class PrismaProviderRegistryRepository implements ProviderRegistryRepository {
  async findAll(): Promise<JobProviderRegistryEntry[]> {
    const records = await prisma.jobProviderRegistry.findMany({ orderBy: { name: "asc" } });
    return records.map(mapRegistry);
  }

  async findByName(name: string): Promise<JobProviderRegistryEntry | null> {
    const record = await prisma.jobProviderRegistry.findUnique({ where: { name } });
    return record ? mapRegistry(record) : null;
  }

  async updateLastRun(name: string, at: Date): Promise<void> {
    await prisma.jobProviderRegistry.update({
      where: { name },
      data: { lastRunAt: at },
    });
  }

  async updateLastHealth(name: string, at: Date): Promise<void> {
    await prisma.jobProviderRegistry.update({
      where: { name },
      data: { lastHealthAt: at },
    });
  }

  async countJobsByProvider(): Promise<Array<{ provider: string; count: number }>> {
    const groups = await prisma.job.groupBy({
      by: ["source"],
      where: { isCatalog: true },
      _count: { _all: true },
    });

    return groups.map((group) => ({
      provider: group.source,
      count: group._count._all,
    }));
  }
}

export const prismaProviderRegistryRepository = new PrismaProviderRegistryRepository();
