import type { DedupLookupRepository } from "../repositories/dedup-lookup.repository.js";
import type { NormalizedJob } from "../entities/normalized-job.entity.js";
import type { DedupResult } from "../value-objects/dedup-result.vo.js";
import {
  computeDescriptionHash,
  computeJobFingerprint,
  normalizeSourceUrl,
} from "./job-normalizer.service.js";

export class DedupStrategy {
  constructor(private readonly lookup: DedupLookupRepository) {}

  async evaluate(job: NormalizedJob): Promise<DedupResult> {
    const byExternal = await this.lookup.findBySourceAndExternalId(job.provider, job.externalId);
    if (byExternal) {
      if (byExternal.contentHash && byExternal.contentHash === job.contentHash) {
        return {
          action: "skip",
          reason: "unchanged",
          existingJobId: byExternal.id,
        };
      }

      return {
        action: "update",
        reason: "source_external_id",
        existingJobId: byExternal.id,
      };
    }

    const byHash = await this.lookup.findByContentHash(job.contentHash);
    if (byHash) {
      return {
        action: "skip",
        reason: "unchanged",
        existingJobId: byHash.id,
      };
    }

    const normalizedUrl = normalizeSourceUrl(job.sourceUrl);
    const byUrl = await this.lookup.findBySourceUrl(normalizedUrl);
    if (byUrl) {
      if (byUrl.contentHash && byUrl.contentHash === job.contentHash) {
        return {
          action: "skip",
          reason: "unchanged",
          existingJobId: byUrl.id,
        };
      }

      return {
        action: "update",
        reason: "source_url",
        existingJobId: byUrl.id,
      };
    }

    const fingerprint = computeJobFingerprint({
      company: job.company,
      title: job.title,
      location: job.location,
    });
    const byFingerprint = await this.lookup.findByFingerprint(fingerprint);
    if (byFingerprint && byFingerprint.source !== job.provider) {
      return {
        action: "attach_alternate",
        reason: "fingerprint_match",
        existingJobId: byFingerprint.id,
      };
    }

    const descriptionHash = computeDescriptionHash(job.description);
    const byDescriptionHash = await this.lookup.findByDescriptionHash(descriptionHash);
    if (byDescriptionHash && byDescriptionHash.source !== job.provider) {
      return {
        action: "attach_alternate",
        reason: "description_hash",
        existingJobId: byDescriptionHash.id,
      };
    }

    return { action: "import", reason: "new_job" };
  }
}
