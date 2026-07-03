import { ValidationError } from "../../../../shared/errors/validation-error.js";
import type { UrlJobExtractResult, UrlJobExtractor } from "../../domain/ports/url-job-extractor.port.js";

const PROGRAMATHOR_JOB_PATTERN = /programathor\.com\.br/i;

export class ProgramathorUrlExtractor implements UrlJobExtractor {
  readonly source = "programathor" as const;

  supports(url: string): boolean {
    try {
      return PROGRAMATHOR_JOB_PATTERN.test(new URL(url.trim()).href);
    } catch {
      return false;
    }
  }

  async extract(_url: string): Promise<UrlJobExtractResult> {
    throw new ValidationError(
      "Programathor URL import is not supported yet. Add the job manually or use a Gupy link.",
    );
  }
}

export const programathorUrlExtractor = new ProgramathorUrlExtractor();
