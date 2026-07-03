import { ValidationError } from "../../../../shared/errors/validation-error.js";
import type { UrlJobExtractResult, UrlJobExtractor } from "../../domain/ports/url-job-extractor.port.js";

const LINKEDIN_JOB_PATTERN = /linkedin\.com\/(jobs\/view|jobs\/search)/i;

export class LinkedinUrlExtractor implements UrlJobExtractor {
  readonly source = "linkedin" as const;

  supports(url: string): boolean {
    try {
      return LINKEDIN_JOB_PATTERN.test(new URL(url.trim()).href);
    } catch {
      return false;
    }
  }

  async extract(_url: string): Promise<UrlJobExtractResult> {
    throw new ValidationError(
      "LinkedIn URL import is not supported yet. Add the job manually or use a Gupy link.",
    );
  }
}

export const linkedinUrlExtractor = new LinkedinUrlExtractor();
