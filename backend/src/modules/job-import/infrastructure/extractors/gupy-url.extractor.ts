import type { NormalizedJob } from "../../../job-aggregation/domain/entities/normalized-job.entity.js";
import { normalizeSourceUrl } from "../../../job-aggregation/domain/services/job-normalizer.service.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ServiceUnavailableError } from "../../../../shared/errors/service-unavailable-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { GUPY_HEADERS } from "../../../../providers/gupy/gupy.constants.js";
import { gupyProvider } from "../../../../providers/gupy/gupy.provider.js";
import type { GupyRawJob } from "../../../../providers/gupy/gupy.types.js";
import type { UrlJobExtractor } from "../../domain/ports/url-job-extractor.port.js";

const GUPY_JOB_API_URL = "https://employability-portal.gupy.io/api/v1/jobs";
const GUPY_PORTAL_JOB_PATTERN = /portal\.gupy\.io\/job\/(\d+)/i;

type GupyJobDetailResponse = GupyRawJob & {
  id?: number;
  careerPageName?: string;
  name?: string;
};

export const parseGupyPortalJobId = (url: string): string | null => {
  try {
    const parsed = new URL(url.trim());
    const match = parsed.href.match(GUPY_PORTAL_JOB_PATTERN);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
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
    return parseGupyPortalJobId(url) !== null;
  }

  async extract(url: string): Promise<NormalizedJob> {
    const jobId = parseGupyPortalJobId(url);
    if (!jobId) {
      throw new ValidationError("Invalid Gupy job URL. Expected https://portal.gupy.io/job/{id}");
    }

    const sourceUrl = normalizeSourceUrl(`https://portal.gupy.io/job/${jobId}`);

    let response: Response;
    try {
      response = await fetch(`${GUPY_JOB_API_URL}/${jobId}`, { headers: GUPY_HEADERS });
    } catch (error) {
      throw new ServiceUnavailableError(
        error instanceof Error ? `Gupy API unavailable: ${error.message}` : "Gupy API unavailable",
      );
    }

    if (response.status === 404) {
      throw new NotFoundError("Gupy job not found or no longer available");
    }

    if (!response.ok) {
      throw new ServiceUnavailableError(`Gupy API returned ${response.status}`);
    }

    const body = (await response.json()) as GupyJobDetailResponse;
    if (!body.name?.trim() || !body.careerPageName?.trim()) {
      throw new ValidationError("Gupy job response is missing required fields");
    }

    return gupyProvider.normalize(toGupyRawJob(body, sourceUrl));
  }
}

export const gupyUrlExtractor = new GupyUrlExtractor();
