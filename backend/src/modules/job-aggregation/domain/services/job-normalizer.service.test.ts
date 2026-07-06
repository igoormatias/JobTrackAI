import { describe, expect, it } from "vitest";

import {
  computeContentHash,
  computeDescriptionHash,
  computeJobFingerprint,
} from "./job-normalizer.service.js";

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

  it("should compute stable job fingerprint", () => {
    const fingerprintA = computeJobFingerprint({
      company: "Acme Corp",
      title: "Desenvolvedor Backend",
      location: "São Paulo, SP",
    });
    const fingerprintB = computeJobFingerprint({
      company: "acme corp",
      title: "desenvolvedor backend",
      location: "são paulo, sp",
    });

    expect(fingerprintA).toBe(fingerprintB);
    expect(fingerprintA).toHaveLength(64);
  });

  it("should compute stable description hash", () => {
    const hashA = computeDescriptionHash("Requisitos:  Node.js   e TypeScript");
    const hashB = computeDescriptionHash("requisitos: node.js e typescript");

    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);
  });
});
