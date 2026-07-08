import type { NormalizedJob } from "../../../job-aggregation/domain/entities/normalized-job.entity.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ServiceUnavailableError } from "../../../../shared/errors/service-unavailable-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { GUPY_HEADERS } from "../../../../providers/gupy/gupy.constants.js";
import {
  GUPY_PAGE_HEADERS,
  parseGupyJobFromPageHtml,
} from "../../../../providers/gupy/gupy-page.parser.js";
import { gupyProvider } from "../../../../providers/gupy/gupy.provider.js";
import type { GupyRawJob } from "../../../../providers/gupy/gupy.types.js";
import { isGupyJobUrl, parseGupyJobUrl } from "../../../../providers/gupy/gupy-url.utils.js";
import type { UrlJobExtractResult, UrlJobExtractor } from "../../domain/ports/url-job-extractor.port.js";

const GUPY_JOB_API_URL = "https://employability-portal.gupy.io/api/v1/jobs";

type GupyJobDetailResponse = GupyRawJob & {
  id?: number;
  careerPageName?: string;
  name?: string;
};

const toGupyRawJob = (raw: GupyJobDetailResponse, sourceUrl: string): GupyRawJob => ({
  jobUrl: sourceUrl,
  name: raw.name?.trim() ?? "",
  careerPageName: raw.careerPageName?.trim() ?? "",
  city: raw.city,
  state: raw.state,
  workplaceType: raw.workplaceType,
  publishedDate: raw.publishedDate,
});

export class GupyUrlExtractor implements UrlJobExtractor {
  readonly source = "gupy" as const;

  supports(url: string): boolean {
    return isGupyJobUrl(url);
  }

  async extract(url: string): Promise<UrlJobExtractResult> {
    const parsed = parseGupyJobUrl(url);
    if (!parsed) {
      throw new ValidationError(
        "Invalid Gupy job URL. Supported: https://portal.gupy.io/job/{id} or https://{company}.gupy.io/jobs/{id}",
      );
    }

    const { jobId, sourceUrl } = parsed;

    let response: Response;
    try {
      response = await fetch(`${GUPY_JOB_API_URL}/${jobId}`, { headers: GUPY_HEADERS });
    } catch (error) {
      throw new ServiceUnavailableError(
        error instanceof Error ? `Gupy API unavailable: ${error.message}` : "Gupy API unavailable",
      );
    }

    if (response.status === 404) {
      return this.extractFromCareerPage(sourceUrl);
    }

    if (!response.ok) {
      throw new ServiceUnavailableError(`Gupy API returned ${response.status}`);
    }

    const body = (await response.json()) as GupyJobDetailResponse;
    if (!body.name?.trim() || !body.careerPageName?.trim()) {
      throw new ValidationError("Gupy job response is missing required fields");
    }

    return { job: gupyProvider.normalize(toGupyRawJob(body, sourceUrl)) };
  }

  private async extractFromCareerPage(sourceUrl: string): Promise<UrlJobExtractResult> {
    let pageResponse: Response;
    try {
      pageResponse = await fetch(sourceUrl, { headers: GUPY_PAGE_HEADERS });
    } catch (error) {
      throw new ServiceUnavailableError(
        error instanceof Error ? `Gupy career page unavailable: ${error.message}` : "Gupy career page unavailable",
      );
    }

    if (!pageResponse.ok) {
      throw new NotFoundError("Gupy job not found or no longer available");
    }

    const html = await pageResponse.text();
    const parsed = parseGupyJobFromPageHtml(html, sourceUrl);
    if (!parsed) {
      throw new NotFoundError("Gupy job not found or no longer available");
    }

    const job = gupyProvider.normalize(parsed.raw);

    return {
      job: {
        ...job,
        description: parsed.description,
        descriptionHtml: parsed.descriptionHtml,
        requirements: parsed.requirements,
        responsibilities: parsed.responsibilities,
        benefits: parsed.benefits,
        technologies: parsed.technologies.length > 0 ? parsed.technologies : job.technologies,
        seniority: parsed.seniority ?? job.seniority,
        modality: parsed.modality ?? job.modality,
      },
      warnings: parsed.warnings.length > 0 ? parsed.warnings : undefined,
    };
  }
}

export const gupyUrlExtractor = new GupyUrlExtractor();

// Re-export for tests that imported parseGupyPortalJobId
export { parseGupyJobUrl as parseGupyPortalJobId } from "../../../../providers/gupy/gupy-url.utils.js";
