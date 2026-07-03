import { jobNormalizer } from "../../../job-aggregation/domain/services/job-normalizer.service.js";
import { jobValidator } from "../../../job-aggregation/domain/services/job-validator.service.js";
import type { DedupLookupRepository } from "../../../job-aggregation/domain/repositories/dedup-lookup.repository.js";
import { prismaDedupLookupRepository } from "../../../job-aggregation/infrastructure/repositories/prisma-dedup-lookup.repository.js";
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
    const normalized = jobNormalizer.ensureContentHash(await this.registry.extract(input.url));
    const validation = jobValidator.validate(normalized);

    if (!validation.valid) {
      throw new ValidationError(validation.error);
    }

    const jobData = validation.job;
    const source = jobData.provider as JobSource;

    const existing =
      (await this.dedupLookup.findBySourceAndExternalId(jobData.provider, jobData.externalId)) ??
      (await this.dedupLookup.findBySourceUrl(jobData.sourceUrl));

    let jobId = existing?.id;

    if (!jobId) {
      const created = await this.jobRepository.createManualJob(input.userId, {
        companyName: jobData.company,
        title: jobData.title,
        sourceUrl: jobData.sourceUrl,
        description: jobData.description,
        source,
        modality: jobData.modality ?? undefined,
        location: jobData.location ?? undefined,
      });
      jobId = created.id;
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
      data: { job, tracking },
      message: input.addToPipeline ? "Job imported and added to pipeline" : "Job imported",
    };
  }
}
