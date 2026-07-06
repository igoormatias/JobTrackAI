import { jobNormalizer } from "../../../job-aggregation/domain/services/job-normalizer.service.js";
import { jobValidator } from "../../../job-aggregation/domain/services/job-validator.service.js";
import { DedupStrategy } from "../../../job-aggregation/domain/services/dedup-strategy.service.js";
import type { DedupLookupRepository } from "../../../job-aggregation/domain/repositories/dedup-lookup.repository.js";
import { prismaDedupLookupRepository } from "../../../job-aggregation/infrastructure/repositories/prisma-dedup-lookup.repository.js";
import { toCatalogUpsertInput } from "../../../job-aggregation/infrastructure/mappers/normalized-job-to-catalog.mapper.js";
import { prismaJobCatalogRepository } from "../../../job-catalog/infrastructure/repositories/prisma-job-catalog.repository.js";
import {
  prismaJobRepository,
  type PrismaJobRepository,
} from "../../../jobs/infrastructure/repositories/prisma-job.repository.js";
import type { Job } from "../../../jobs/types/job.types.js";
import { trackingService, type TrackingService } from "../../../tracking/application/tracking.service.js";
import type { JobTrackingEntity } from "../../../tracking/domain/entities/job-tracking.entity.js";
import type { JobSource } from "../../../../shared/domain/job-source.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { shouldUpdateSourceUrlOnImport } from "../../../../shared/utils/source-url-merge.utils.js";
import type { UrlExtractorRegistry } from "../../infrastructure/extractors/url-extractor.registry.js";
import { urlExtractorRegistry } from "../../infrastructure/extractors/url-extractor.registry.js";

export type ConfirmJobImportInput = {
  userId: string;
  url: string;
  addToPipeline?: boolean;
};

export type ConfirmJobImportResponse = {
  data: {
    job: Job;
    tracking?: JobTrackingEntity;
    isExisting?: boolean;
  };
  message: string;
};

export class ConfirmJobImportUseCase {
  constructor(
    private readonly registry: UrlExtractorRegistry = urlExtractorRegistry,
    private readonly dedupLookup: DedupLookupRepository = prismaDedupLookupRepository,
    private readonly jobRepository: PrismaJobRepository = prismaJobRepository,
    private readonly tracking: TrackingService = trackingService,
  ) {}

  async execute(input: ConfirmJobImportInput): Promise<ConfirmJobImportResponse> {
    const normalized = jobNormalizer.ensureContentHash((await this.registry.extract(input.url)).job);
    const validation = jobValidator.validate(normalized);

    if (!validation.valid) {
      throw new ValidationError(validation.error);
    }

    const jobData = validation.job;
    const source = jobData.provider as JobSource;
    const dedup = new DedupStrategy(this.dedupLookup);
    const dedupResult = await dedup.evaluate(jobData);

    let jobId: string | undefined;
    let isExisting = false;

    if (dedupResult.existingJobId && dedupResult.action === "skip") {
      jobId = dedupResult.existingJobId;
      isExisting = true;
    } else if (dedupResult.existingJobId && dedupResult.action === "update") {
      jobId = dedupResult.existingJobId;
      const catalogInput = toCatalogUpsertInput(jobData);
      await prismaJobCatalogRepository.upsertCatalogJob({ ...catalogInput, id: jobId });
      isExisting = true;
    }

    if (!jobId) {
      const created = await this.jobRepository.createManualJob(input.userId, {
        companyName: jobData.company,
        title: jobData.title,
        sourceUrl: jobData.sourceUrl,
        description: jobData.description,
        source,
        modality: jobData.modality ?? undefined,
        location: jobData.location ?? undefined,
        externalId: jobData.externalId,
        contentHash: jobData.contentHash,
        technologies: jobData.technologies?.map((name) => ({ name })),
      });
      jobId = created.id;
    } else {
      const existingMatch =
        (await this.dedupLookup.findBySourceAndExternalId(jobData.provider, jobData.externalId)) ??
        (await this.dedupLookup.findBySourceUrl(jobData.sourceUrl));
      if (shouldUpdateSourceUrlOnImport(existingMatch?.sourceUrl, jobData.sourceUrl)) {
        await this.jobRepository.updateSourceUrl(jobId, jobData.sourceUrl);
      }
    }

    const job = await this.jobRepository.findByIdForUser(jobId, { userId: input.userId });
    if (!job) {
      throw new NotFoundError("Imported job not found");
    }

    let tracking: JobTrackingEntity | undefined;
    if (input.addToPipeline) {
      const existingTracking = await this.tracking.findByJobId(input.userId, jobId);
      tracking =
        existingTracking ??
        (await this.tracking.create({
          userId: input.userId,
          jobId,
          stage: "discovery",
          stageOccurredAt: new Date().toISOString(),
        }));
    }

    return {
      data: { job, tracking, isExisting },
      message: isExisting
        ? input.addToPipeline
          ? "Existing job linked to pipeline"
          : "Job already exists"
        : input.addToPipeline
          ? "Job imported and added to pipeline"
          : "Job imported",
    };
  }
}
