import { logger } from "../../../../config/logger.js";
import type { JobCatalogRepository } from "../../../job-catalog/domain/repositories/job-catalog.repository.js";
import type { CatalogJobUpsertInput } from "../../../job-catalog/domain/value-objects/catalog-list-filters.js";
import type { JobImportRecord } from "../../domain/entities/job-import.entity.js";
import type { ProviderExecution } from "../../domain/entities/provider-execution.entity.js";
import type { JobProviderPort } from "../../domain/ports/job-provider.port.js";
import type { DedupLookupRepository } from "../../domain/repositories/dedup-lookup.repository.js";
import type { JobImportRepository } from "../../domain/repositories/job-import.repository.js";
import type { ProviderExecutionRepository } from "../../domain/repositories/provider-execution.repository.js";
import type { ProviderRegistryRepository } from "../../domain/repositories/provider-registry.repository.js";
import { DedupStrategy } from "../../domain/services/dedup-strategy.service.js";
import { jobNormalizer } from "../../domain/services/job-normalizer.service.js";
import { jobValidator } from "../../domain/services/job-validator.service.js";
import { toCatalogUpsertInput } from "../../infrastructure/mappers/normalized-job-to-catalog.mapper.js";

const BATCH_SIZE = 50;
const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGES = 100;

type AggregationCounts = {
  foundCount: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
};

export class JobAggregationService {
  private readonly runningProviders = new Map<string, Promise<ProviderExecution>>();

  constructor(
    private readonly providers: Map<string, JobProviderPort>,
    private readonly executionRepo: ProviderExecutionRepository,
    private readonly importRepo: JobImportRepository,
    private readonly registryRepo: ProviderRegistryRepository,
    private readonly catalogRepo: JobCatalogRepository,
    private readonly dedupLookup: DedupLookupRepository,
  ) {}

  async runProvider(providerName: string): Promise<ProviderExecution> {
    const existing = this.runningProviders.get(providerName);
    if (existing) return existing;

    const promise = this.executeProvider(providerName).finally(() => {
      this.runningProviders.delete(providerName);
    });

    this.runningProviders.set(providerName, promise);
    return promise;
  }

  async runAllEnabled(): Promise<ProviderExecution[]> {
    const registry = await this.registryRepo.findAll();
    const enabled = registry.filter((entry) => entry.enabled);
    const results = await Promise.allSettled(
      enabled.map((entry) => this.runProvider(entry.name)),
    );

    return results
      .filter((result): result is PromiseFulfilledResult<ProviderExecution> => result.status === "fulfilled")
      .map((result) => result.value);
  }

  private async executeProvider(providerName: string): Promise<ProviderExecution> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}`);
    }

    const execution = await this.executionRepo.create({ providerName });
    const startedAt = Date.now();
    const counts: AggregationCounts = {
      foundCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      failedCount: 0,
    };
    const importRecords: Array<Parameters<JobImportRepository["create"]>[0]> = [];
    const upsertBatch: Array<{ input: CatalogJobUpsertInput; action: "import" | "update" }> = [];

    try {
      const health = await provider.health();
      await this.registryRepo.updateLastHealth(providerName, health.checkedAt);

      if (health.status === "unhealthy") {
        throw new Error(health.message ?? `Provider ${providerName} is unhealthy`);
      }

      const dedup = new DedupStrategy(this.dedupLookup);
      let offset = 0;
      let page = 0;
      let hasMore = true;

      while (hasMore && page < MAX_PAGES) {
        const result = await provider.search({
          limit: DEFAULT_PAGE_LIMIT,
          offset,
        });

        counts.foundCount += result.jobs.length;
        hasMore = result.hasMore;
        offset += DEFAULT_PAGE_LIMIT;
        page += 1;

        for (const raw of result.jobs) {
          try {
            const normalized = jobNormalizer.ensureContentHash(provider.normalize(raw));
            const validation = jobValidator.validate(normalized);

            if (!validation.valid) {
              counts.failedCount += 1;
              importRecords.push({
                executionId: execution.id,
                providerName,
                externalId: normalized.externalId,
                sourceUrl: normalized.sourceUrl,
                contentHash: normalized.contentHash,
                status: "failed",
                errorMessage: validation.error,
              });
              continue;
            }

            const dedupResult = await dedup.evaluate(validation.job);

            if (dedupResult.action === "skip") {
              counts.duplicateCount += 1;
              importRecords.push({
                executionId: execution.id,
                providerName,
                externalId: validation.job.externalId,
                sourceUrl: validation.job.sourceUrl,
                contentHash: validation.job.contentHash,
                status: "duplicate",
                jobId: dedupResult.existingJobId,
              });
              continue;
            }

            const catalogInput = toCatalogUpsertInput(validation.job);
            upsertBatch.push({ input: catalogInput, action: dedupResult.action });

            if (upsertBatch.length >= BATCH_SIZE) {
              await this.flushBatch(upsertBatch, importRecords, execution.id, providerName, counts);
            }
          } catch (error) {
            counts.failedCount += 1;
            importRecords.push({
              executionId: execution.id,
              providerName,
              status: "failed",
              errorMessage: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        if (!result.jobs.length) break;
      }

      if (upsertBatch.length > 0) {
        await this.flushBatch(upsertBatch, importRecords, execution.id, providerName, counts);
      }

      if (importRecords.length > 0) {
        await this.importRepo.createMany(importRecords);
      }

      await this.registryRepo.updateLastRun(providerName, new Date());

      const finished = await this.executionRepo.finish(execution.id, {
        status: "completed",
        ...counts,
      });

      logger.info(
        {
          provider: providerName,
          durationMs: Date.now() - startedAt,
          ...counts,
        },
        "Provider sync completed",
      );

      return finished;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const finished = await this.executionRepo.finish(execution.id, {
        status: "failed",
        ...counts,
        errorMessage: message,
      });

      logger.error(
        {
          provider: providerName,
          durationMs: Date.now() - startedAt,
          error: message,
          ...counts,
        },
        "Provider sync failed",
      );

      return finished;
    }
  }

  private async flushBatch(
    batch: Array<{ input: CatalogJobUpsertInput; action: "import" | "update" }>,
    importRecords: Array<Parameters<JobImportRepository["create"]>[0]>,
    executionId: string,
    providerName: string,
    counts: AggregationCounts,
  ): Promise<void> {
    const items = batch.splice(0, batch.length);
    const inputs = items.map((item) => item.input);
    const result = await this.catalogRepo.upsertManyCatalogJobs(inputs);

    counts.importedCount += result.imported + result.updated;

    for (const item of items) {
      importRecords.push({
        executionId,
        providerName,
        externalId: item.input.externalId,
        sourceUrl: item.input.sourceUrl,
        contentHash: item.input.contentHash,
        status: item.action === "update" ? "updated" : "imported",
      });
    }
  }
}
