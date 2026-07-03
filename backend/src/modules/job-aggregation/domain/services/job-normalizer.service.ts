import { createHash } from "node:crypto";

import type { NormalizedJob } from "../entities/normalized-job.entity.js";

const normalizeText = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const computeContentHash = (input: {
  title: string;
  company: string;
  sourceUrl: string;
  publishedAt: Date;
}): string => {
  const payload = [
    normalizeText(input.title),
    normalizeText(input.company),
    input.sourceUrl.trim().toLowerCase(),
    input.publishedAt.toISOString(),
  ].join("|");

  return createHash("sha256").update(payload).digest("hex");
};

export const normalizeSourceUrl = (url: string): string => {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim().toLowerCase();
  }
};

export class JobNormalizer {
  ensureContentHash(job: NormalizedJob): NormalizedJob {
    if (job.contentHash) return job;
    return {
      ...job,
      contentHash: computeContentHash({
        title: job.title,
        company: job.company,
        sourceUrl: job.sourceUrl,
        publishedAt: job.publishedAt,
      }),
    };
  }
}

export const jobNormalizer = new JobNormalizer();
