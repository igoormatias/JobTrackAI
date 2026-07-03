import { describe, expect, it } from "vitest";

import { buildSeedExternalId, buildSourceUrl } from "./catalog-data.js";

describe("catalog-data seed URLs", () => {
  it("uses numeric externalId for gupy", () => {
    const externalId = buildSeedExternalId("gupy", 217);
    expect(externalId).toBe("10217");
    expect(buildSourceUrl("gupy", externalId)).toBe("https://portal.gupy.io/job/10217");
  });

  it("keeps prefixed externalId for other providers", () => {
    const externalId = buildSeedExternalId("linkedin", 1);
    expect(externalId).toBe("linkedin_job_0001");
    expect(buildSourceUrl("linkedin", externalId)).toContain("linkedin.com");
  });
});
