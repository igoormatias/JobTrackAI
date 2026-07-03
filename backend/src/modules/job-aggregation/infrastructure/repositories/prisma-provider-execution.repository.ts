import { prisma } from "../../../../database/prisma.js";
import type {
  CreateProviderExecutionInput,
  FinishProviderExecutionInput,
  ProviderExecution,
} from "../../domain/entities/provider-execution.entity.js";
import type {
  ProviderExecutionRepository,
  ProviderHistoryQuery,
  ProviderHistoryResult,
} from "../../domain/repositories/provider-execution.repository.js";

const mapExecution = (record: {
  id: string;
  providerName: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
  foundCount: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  errorMessage: string | null;
}): ProviderExecution => ({
  id: record.id,
  providerName: record.providerName,
  status: record.status as ProviderExecution["status"],
  startedAt: record.startedAt,
  finishedAt: record.finishedAt,
  durationMs: record.durationMs,
  foundCount: record.foundCount,
  importedCount: record.importedCount,
  duplicateCount: record.duplicateCount,
  failedCount: record.failedCount,
  errorMessage: record.errorMessage,
});

export class PrismaProviderExecutionRepository implements ProviderExecutionRepository {
  async create(input: CreateProviderExecutionInput): Promise<ProviderExecution> {
    const record = await prisma.providerExecution.create({
      data: {
        providerName: input.providerName,
        status: "running",
      },
    });
    return mapExecution(record);
  }

  async finish(id: string, input: FinishProviderExecutionInput): Promise<ProviderExecution> {
    const finishedAt = new Date();
    const started = await prisma.providerExecution.findUniqueOrThrow({ where: { id } });
    const durationMs = finishedAt.getTime() - started.startedAt.getTime();

    const record = await prisma.providerExecution.update({
      where: { id },
      data: {
        status: input.status,
        finishedAt,
        durationMs,
        foundCount: input.foundCount,
        importedCount: input.importedCount,
        duplicateCount: input.duplicateCount,
        failedCount: input.failedCount,
        errorMessage: input.errorMessage,
      },
    });

    return mapExecution(record);
  }

  async findHistory(query: ProviderHistoryQuery): Promise<ProviderHistoryResult> {
    const limit = query.limit ?? 20;
    const records = await prisma.providerExecution.findMany({
      where: {
        providerName: query.providerName,
        ...(query.cursor ? { id: { lt: query.cursor } } : {}),
      },
      orderBy: { startedAt: "desc" },
      take: limit + 1,
    });

    const hasMore = records.length > limit;
    const page = hasMore ? records.slice(0, limit) : records;

    return {
      data: page.map(mapExecution),
      hasMore,
      nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null,
    };
  }

  async findLastFinishedAt(): Promise<Date | null> {
    const record = await prisma.providerExecution.findFirst({
      where: { finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
      select: { finishedAt: true },
    });
    return record?.finishedAt ?? null;
  }

  async countFailedSince(since: Date): Promise<number> {
    return prisma.providerExecution.count({
      where: {
        status: "failed",
        startedAt: { gte: since },
      },
    });
  }
}

export const prismaProviderExecutionRepository = new PrismaProviderExecutionRepository();
