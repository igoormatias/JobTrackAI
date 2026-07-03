import { describe, expect, it } from "vitest";

import { computeContentHash } from "./job-normalizer.service.js";

describe("JobNormalizer", () => {
  it("should compute stable content hash", () => {
    const publishedAt = new Date("2025-01-15T10:00:00.000Z");
    const hashA = computeContentHash({
      title: "Desenvolvedor Backend",
      company: "Acme",
      sourceUrl: "https://portal.gupy.io/job/123",
      publishedAt,
    });
    const hashB = computeContentHash({
      title: "desenvolvedor backend",
      company: "acme",
      sourceUrl: "https://portal.gupy.io/job/123",
      publishedAt,
    });

    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);
  });
});
