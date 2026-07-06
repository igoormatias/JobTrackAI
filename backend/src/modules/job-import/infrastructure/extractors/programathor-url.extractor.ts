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
      "Importação por URL do Programathor em breve. Use um link Gupy ou LinkedIn, ou cadastre a vaga manualmente.",
    );
  }
}

export const programathorUrlExtractor = new ProgramathorUrlExtractor();
