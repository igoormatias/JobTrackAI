import { jobNormalizer } from "../../../job-aggregation/domain/services/job-normalizer.service.js";
import { jobValidator } from "../../../job-aggregation/domain/services/job-validator.service.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import type { UrlExtractorRegistry } from "../../infrastructure/extractors/url-extractor.registry.js";
import { urlExtractorRegistry } from "../../infrastructure/extractors/url-extractor.registry.js";

export type JobImportPreviewDto = {
  title: string;
  company: string;
  description: string;
  source: string;
  sourceUrl: string;
  modality: string | null;
  location: string | null;
  externalId: string;
  provider: string;
};

export type PreviewJobFromUrlInput = {
  url: string;
};

export type PreviewJobFromUrlResponse = {
  data: JobImportPreviewDto;
};

export class PreviewJobFromUrlUseCase {
  constructor(private readonly registry: UrlExtractorRegistry = urlExtractorRegistry) {}

  async execute(input: PreviewJobFromUrlInput): Promise<PreviewJobFromUrlResponse> {
    const normalized = jobNormalizer.ensureContentHash(await this.registry.extract(input.url));
    const validation = jobValidator.validate(normalized);

    if (!validation.valid) {
      throw new ValidationError(validation.error);
    }

    const job = validation.job;

    return {
      data: {
        title: job.title,
        company: job.company,
        description: job.description,
        source: job.provider,
        sourceUrl: job.sourceUrl,
        modality: job.modality ?? null,
        location: job.location ?? null,
        externalId: job.externalId,
        provider: job.provider,
      },
    };
  }
}
