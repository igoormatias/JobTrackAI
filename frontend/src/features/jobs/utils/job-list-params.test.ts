import { describe, expect, it } from "vitest";

import {
  countActiveJobFilters,
  hasActiveJobFilters,
  urlFiltersToJobListParams,
} from "./job-list-params";

describe("job-list-params", () => {
  it("does not derive strictProfileMatch from suggested filters", () => {
    const params = urlFiltersToJobListParams({
      suggested: true,
      areas: ["frontend"],
      skills: ["react"],
      sort: "match",
      dir: "desc",
    });

    expect(params.suggested).toBe(true);
    expect(params.areas).toEqual(["frontend"]);
    expect(params).not.toHaveProperty("strictProfileMatch");
    expect(params).not.toHaveProperty("matchMin");
  });

  it("counts active filter categories", () => {
    const count = countActiveJobFilters({
      search: "react",
      areas: ["frontend"],
      modalities: ["remote"],
      suggested: true,
      sort: "recent",
      dir: "desc",
    });

    expect(count).toBe(4);
    expect(hasActiveJobFilters({ sort: "recent", dir: "desc" })).toBe(false);
  });
});
