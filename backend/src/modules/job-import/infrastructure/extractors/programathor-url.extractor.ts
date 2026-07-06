import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ServiceUnavailableError } from "../../../../shared/errors/service-unavailable-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { parseProgramathorJobViewHtml } from "../../../../providers/programathor/programathor-html.parser.js";
import { PROGRAMATHOR_HEADERS } from "../../../../providers/programathor/programathor.constants.js";
import { programathorProvider } from "../../../../providers/programathor/programathor.provider.js";
import type { UrlJobExtractResult, UrlJobExtractor } from "../../domain/ports/url-job-extractor.port.js";

const PROGRAMATHOR_JOB_PATTERN = /programathor\.com\.br\/jobs\/\d+/i;

export class ProgramathorUrlExtractor implements UrlJobExtractor {
  readonly source = "programathor" as const;

  supports(url: string): boolean {
    try {
      return PROGRAMATHOR_JOB_PATTERN.test(new URL(url.trim()).href);
    } catch {
      return false;
    }
  }

  async extract(url: string): Promise<UrlJobExtractResult> {
    const trimmed = url.trim();
    let response: Response;
    try {
      response = await fetch(trimmed, { headers: PROGRAMATHOR_HEADERS });
    } catch (error) {
      throw new ServiceUnavailableError(
        error instanceof Error
          ? `Programathor page unavailable: ${error.message}`
          : "Programathor page unavailable",
      );
    }

    if (!response.ok) {
      throw new NotFoundError("Programathor job not found or no longer available");
    }

    const html = await response.text();
    const finalUrl = response.url.trim();

    if (!PROGRAMATHOR_JOB_PATTERN.test(finalUrl)) {
      throw new ValidationError(
        "Programathor redirecionou para outra página. Verifique se o link aponta para uma vaga válida.",
      );
    }

    const parsed = parseProgramathorJobViewHtml(html, finalUrl);
    if (!parsed) {
      throw new ValidationError(
        "Não foi possível extrair a vaga do Programathor. O link pode estar expirado — use cadastro manual.",
      );
    }

    return { job: programathorProvider.normalize(parsed) };
  }
}

export const programathorUrlExtractor = new ProgramathorUrlExtractor();
