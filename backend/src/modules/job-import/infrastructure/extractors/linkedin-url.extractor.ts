import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ServiceUnavailableError } from "../../../../shared/errors/service-unavailable-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { linkedinProvider } from "../../../../providers/linkedin/linkedin.provider.js";
import { parseLinkedinJobViewHtml } from "../../../../providers/linkedin/linkedin-html.parser.js";
import { LINKEDIN_HEADERS } from "../../../../providers/linkedin/linkedin.constants.js";
import type { UrlJobExtractResult, UrlJobExtractor } from "../../domain/ports/url-job-extractor.port.js";

const LINKEDIN_VIEW_PATTERN = /linkedin\.com\/jobs\/view\/\d+/i;

export class LinkedinUrlExtractor implements UrlJobExtractor {
  readonly source = "linkedin" as const;

  supports(url: string): boolean {
    try {
      return LINKEDIN_VIEW_PATTERN.test(new URL(url.trim()).href);
    } catch {
      return false;
    }
  }

  async extract(url: string): Promise<UrlJobExtractResult> {
    const trimmed = url.trim();
    let response: Response;
    try {
      response = await fetch(trimmed, { headers: LINKEDIN_HEADERS });
    } catch (error) {
      throw new ServiceUnavailableError(
        error instanceof Error ? `LinkedIn page unavailable: ${error.message}` : "LinkedIn page unavailable",
      );
    }

    if (!response.ok) {
      throw new NotFoundError("LinkedIn job not found or no longer available");
    }

    const html = await response.text();
    const parsed = parseLinkedinJobViewHtml(html, trimmed);
    if (!parsed) {
      throw new ValidationError("Could not extract job data from LinkedIn page");
    }

    return { job: linkedinProvider.normalize(parsed) };
  }
}

export const linkedinUrlExtractor = new LinkedinUrlExtractor();
