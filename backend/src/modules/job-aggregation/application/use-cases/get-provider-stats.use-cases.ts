import type { ProviderExecutionRepository } from "../../domain/repositories/provider-execution.repository.js";
import type { ProviderRegistryRepository } from "../../domain/repositories/provider-registry.repository.js";
import type { DedupLookupRepository } from "../../domain/repositories/dedup-lookup.repository.js";
import type { ProviderHistoryQuery } from "../../domain/repositories/provider-execution.repository.js";
import type {
  ProviderHistoryResponseDto,
  ProviderStatisticsDto,
} from "../dto/provider-response.dto.js";
import { toProviderExecutionDto } from "../mappers/provider.mapper.js";

export class GetProviderHistoryUseCase {
  constructor(private readonly executionRepo: ProviderExecutionRepository) {}

  async execute(query: ProviderHistoryQuery): Promise<ProviderHistoryResponseDto> {
    const result = await this.executionRepo.findHistory(query);
    return {
      data: result.data.map(toProviderExecutionDto),
      meta: {
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      },
    };
  }
}

export class GetProviderStatisticsUseCase {
  constructor(
    private readonly executionRepo: ProviderExecutionRepository,
    private readonly registryRepo: ProviderRegistryRepository,
    private readonly dedupLookup: DedupLookupRepository,
  ) {}

  async execute(): Promise<ProviderStatisticsDto> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [lastSyncAt, providerErrors24h, jobsByProvider, totalCatalogJobs, recentHistory] =
      await Promise.all([
        this.executionRepo.findLastFinishedAt(),
        this.executionRepo.countFailedSince(since),
        this.registryRepo.countJobsByProvider(),
        this.dedupLookup.countCatalogJobs(),
        this.executionRepo.findHistory({ limit: 5 }),
      ]);

    return {
      totalCatalogJobs,
      jobsByProvider,
      lastSyncAt: lastSyncAt?.toISOString() ?? null,
      providerErrors24h,
      recentExecutions: recentHistory.data.map(toProviderExecutionDto),
    };
  }
}
