import { ValidationError } from "../../../../shared/errors/validation-error.js";
import type { NormalizedJob } from "../../../job-aggregation/domain/entities/normalized-job.entity.js";
import type { UrlJobExtractor } from "../../domain/ports/url-job-extractor.port.js";
import { gupyUrlExtractor } from "./gupy-url.extractor.js";
import { linkedinUrlExtractor } from "./linkedin-url.extractor.js";
import { programathorUrlExtractor } from "./programathor-url.extractor.js";

const defaultExtractors: UrlJobExtractor[] = [
  gupyUrlExtractor,
  linkedinUrlExtractor,
  programathorUrlExtractor,
];

export class UrlExtractorRegistry {
  constructor(private readonly extractors: UrlJobExtractor[] = defaultExtractors) {}

  resolve(url: string): UrlJobExtractor {
    const extractor = this.extractors.find((item) => item.supports(url));
    if (!extractor) {
      throw new ValidationError(
        "Unsupported job URL. Supported: Gupy (portal.gupy.io/job/{id} or {company}.gupy.io/jobs/{id}). LinkedIn and Programathor coming soon.",
      );
    }
    return extractor;
  }

  async extract(url: string): Promise<NormalizedJob> {
    return this.resolve(url).extract(url);
  }
}

export const urlExtractorRegistry = new UrlExtractorRegistry();
