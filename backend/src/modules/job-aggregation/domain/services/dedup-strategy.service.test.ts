import { describe, expect, it, vi } from "vitest";

import type { DedupLookupRepository } from "../repositories/dedup-lookup.repository.js";
import { DedupStrategy } from "./dedup-strategy.service.js";
import type { NormalizedJob } from "../entities/normalized-job.entity.js";

const baseJob: NormalizedJob = {
  title: "Backend Dev",
  company: "Acme",
  description: "desc",
  technologies: [],
  sourceUrl: "https://portal.gupy.io/job/123",
  provider: "gupy",
  publishedAt: new Date("2025-01-01"),
  contentHash: "hash-123",
  externalId: "123",
};

const createLookup = (overrides: Partial<DedupLookupRepository> = {}): DedupLookupRepository => ({
  findBySourceAndExternalId: vi.fn().mockResolvedValue(null),
  findByContentHash: vi.fn().mockResolvedValue(null),
  findBySourceUrl: vi.fn().mockResolvedValue(null),
  findByFingerprint: vi.fn().mockResolvedValue(null),
  findByDescriptionHash: vi.fn().mockResolvedValue(null),
  countCatalogJobs: vi.fn().mockResolvedValue(0),
  ...overrides,
});

describe("DedupStrategy", () => {
  it("should skip when content hash matches on same external id", async () => {
    const lookup = createLookup({
      findBySourceAndExternalId: vi.fn().mockResolvedValue({
        id: "job-1",
        source: "gupy",
        externalId: "123",
        contentHash: "hash-123",
      }),
    });
    const strategy = new DedupStrategy(lookup);

    const result = await strategy.evaluate(baseJob);

    expect(result.action).toBe("skip");
    expect(result.reason).toBe("unchanged");
  });

  it("should update when source and externalId already exist with different hash", async () => {
    const lookup = createLookup({
      findBySourceAndExternalId: vi.fn().mockResolvedValue({ id: "job-1", source: "gupy", externalId: "123", contentHash: "other-hash" }),
    });
    const strategy = new DedupStrategy(lookup);

    const result = await strategy.evaluate(baseJob);

    expect(result.action).toBe("update");
    expect(result.existingJobId).toBe("job-1");
  });

  it("should skip unchanged when content hash matches existing job", async () => {
    const lookup = createLookup({
      findByContentHash: vi.fn().mockResolvedValue({ id: "job-2", source: "gupy", contentHash: "hash-123" }),
    });
    const strategy = new DedupStrategy(lookup);

    const result = await strategy.evaluate(baseJob);

    expect(result.action).toBe("skip");
    expect(result.reason).toBe("unchanged");
  });

  it("should update when source url matches with different hash", async () => {
    const lookup = createLookup({
      findBySourceUrl: vi.fn().mockResolvedValue({
        id: "job-3",
        source: "gupy",
        contentHash: "old-hash",
        sourceUrl: baseJob.sourceUrl,
      }),
    });
    const strategy = new DedupStrategy(lookup);

    const result = await strategy.evaluate(baseJob);

    expect(result.action).toBe("update");
    expect(result.reason).toBe("source_url");
    expect(result.existingJobId).toBe("job-3");
  });

  it("should import when no duplicate is found", async () => {
    const strategy = new DedupStrategy(createLookup());
    const result = await strategy.evaluate(baseJob);
    expect(result.action).toBe("import");
  });

  it("should attach alternate when fingerprint matches a different provider", async () => {
    const lookup = createLookup({
      findByFingerprint: vi.fn().mockResolvedValue({
        id: "job-linkedin",
        source: "linkedin",
        externalId: "ln-456",
      }),
    });
    const strategy = new DedupStrategy(lookup);

    const result = await strategy.evaluate(baseJob);

    expect(result.action).toBe("attach_alternate");
    expect(result.reason).toBe("fingerprint_match");
    expect(result.existingJobId).toBe("job-linkedin");
  });

  it("should attach alternate when description hash matches a different provider", async () => {
    const lookup = createLookup({
      findByDescriptionHash: vi.fn().mockResolvedValue({
        id: "job-linkedin",
        source: "linkedin",
        externalId: "ln-456",
      }),
    });
    const strategy = new DedupStrategy(lookup);

    const result = await strategy.evaluate(baseJob);

    expect(result.action).toBe("attach_alternate");
    expect(result.reason).toBe("description_hash");
    expect(result.existingJobId).toBe("job-linkedin");
  });
});
