import { normalizeSourceUrl } from "../../modules/job-aggregation/domain/services/job-normalizer.service.js";

export type ParsedGupyJobUrl = {
  jobId: string;
  sourceUrl: string;
};

/**
 * Supports:
 * - https://portal.gupy.io/job/{id}
 * - https://{company}.gupy.io/jobs/{id}
 */
export const parseGupyJobUrl = (rawUrl: string): ParsedGupyJobUrl | null => {
  try {
    const parsed = new URL(rawUrl.trim());
    if (!parsed.hostname.endsWith("gupy.io")) {
      return null;
    }

    const portalMatch = parsed.pathname.match(/^\/job\/(\d+)\/?$/i);
    if (portalMatch?.[1]) {
      return {
        jobId: portalMatch[1],
        sourceUrl: normalizeSourceUrl(parsed.href),
      };
    }

    const careerPageMatch = parsed.pathname.match(/^\/jobs\/(\d+)\/?$/i);
    if (careerPageMatch?.[1]) {
      return {
        jobId: careerPageMatch[1],
        sourceUrl: normalizeSourceUrl(parsed.href),
      };
    }

    return null;
  } catch {
    return null;
  }
};

export const isGupyJobUrl = (url: string): boolean => parseGupyJobUrl(url) !== null;
