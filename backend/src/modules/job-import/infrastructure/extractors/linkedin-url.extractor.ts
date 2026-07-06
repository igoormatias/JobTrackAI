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
    const finalUrl = response.url.trim();

    if (!LINKEDIN_VIEW_PATTERN.test(finalUrl)) {
      throw new ValidationError(
        "LinkedIn redirecionou para outra página. A vaga pode exigir login — tente cadastro manual ou copie o link direto da publicação.",
      );
    }

    const parsed = parseLinkedinJobViewHtml(html, finalUrl);
    if (!parsed) {
      throw new ValidationError(
        "Não foi possível extrair a vaga do LinkedIn. A página pode exigir login ou o link pode estar expirado — use cadastro manual.",
      );
    }

    return { job: linkedinProvider.normalize(parsed) };
  }
}

export const linkedinUrlExtractor = new LinkedinUrlExtractor();
