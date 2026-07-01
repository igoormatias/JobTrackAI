import { describe, expect, it } from "vitest";

import {
  hasActiveJobFilters,
  jobListParamsToUrlFilters,
  parseJobUrlSearchParams,
  urlFiltersToJobListParams,
} from "./job-list-params";

describe("job-list-params", () => {
  it("maps search URL param to API q", () => {
    const params = urlFiltersToJobListParams({ search: "react" });
    expect(params.q).toBe("react");
  });

  it("parses comma-separated arrays from URL", () => {
    const filters = parseJobUrlSearchParams(
      new URLSearchParams("search=react&areas=frontend,backend&skills=react,nextjs"),
    );

    expect(filters.search).toBe("react");
    expect(filters.areas).toEqual(["frontend", "backend"]);
    expect(filters.skills).toEqual(["react", "nextjs"]);
  });

  it("round-trips singular legacy params to URL filters", () => {
    const filters = jobListParamsToUrlFilters({
      area: "frontend",
      companyId: "company_0001",
      seniority: "senior",
      modality: "remote",
    });

    expect(filters.areas).toEqual(["frontend"]);
    expect(filters.companyIds).toEqual(["company_0001"]);
    expect(filters.seniorities).toEqual(["senior"]);
    expect(filters.modalities).toEqual(["remote"]);
  });

  it("detects active filters", () => {
    expect(hasActiveJobFilters({})).toBe(false);
    expect(hasActiveJobFilters({ search: "node" })).toBe(true);
    expect(hasActiveJobFilters({ matchMin: 80 })).toBe(true);
  });
});
