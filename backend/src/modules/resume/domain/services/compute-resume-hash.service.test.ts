import { describe, expect, it } from "vitest";

import { computeResumeAnalysisHash, computeResumeContentHash } from "./compute-resume-hash.service.js";
import { applySuggestionToContent } from "./resume-content.service.js";
import { EMPTY_RESUME_CONTENT } from "../entities/resume.entity.js";

describe("compute-resume-hash", () => {
  it("produces stable hash for same content", () => {
    const hash1 = computeResumeContentHash(EMPTY_RESUME_CONTENT);
    const hash2 = computeResumeContentHash(EMPTY_RESUME_CONTENT);
    expect(hash1).toBe(hash2);
  });

  it("produces different hash when content changes", () => {
    const hash1 = computeResumeContentHash(EMPTY_RESUME_CONTENT);
    const hash2 = computeResumeContentHash({
      ...EMPTY_RESUME_CONTENT,
      professionalSummary: "Dev",
    });
    expect(hash1).not.toBe(hash2);
  });

  it("computes analysis hash from snapshot", () => {
    const hash = computeResumeAnalysisHash({ job: { id: "1" }, resume: { v: 1 } });
    expect(hash).toHaveLength(64);
  });
});

describe("resume-content.service", () => {
  it("applies suggestion to summary", () => {
    const updated = applySuggestionToContent(
      { ...EMPTY_RESUME_CONTENT, professionalSummary: "Old" },
      "professionalSummary",
      "New summary",
    );
    expect(updated.professionalSummary).toBe("New summary");
  });
});
