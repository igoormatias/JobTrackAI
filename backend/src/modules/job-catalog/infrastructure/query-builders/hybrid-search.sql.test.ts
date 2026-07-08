import { describe, expect, it } from "vitest";

import {
  SEARCH_RANK_WEIGHTS,
  buildHybridRankSql,
  buildHybridWhereSql,
  sanitizeSearchQuery,
  toTsQueryTerms,
} from "./hybrid-search.sql.js";

describe("hybrid-search.sql", () => {
  it("sanitizes query tokens and preserves technology-like tokens", () => {
    expect(sanitizeSearchQuery("  React!! Node.js  ")).toBe("React Node.js");
    expect(sanitizeSearchQuery("C# / .NET")).toContain("C#");
  });

  it("builds prefix tsquery terms", () => {
    expect(toTsQueryTerms("React")).toBe("React:*");
    expect(toTsQueryTerms("Node.js Frontend")).toBe("Node.js:* & Frontend:*");
    expect(toTsQueryTerms("a")).toBe("");
  });

  it("ranks title higher than description", () => {
    expect(SEARCH_RANK_WEIGHTS.title).toBeGreaterThan(SEARCH_RANK_WEIGHTS.company);
    expect(SEARCH_RANK_WEIGHTS.company).toBeGreaterThan(SEARCH_RANK_WEIGHTS.technology);
    expect(SEARCH_RANK_WEIGHTS.technology).toBeGreaterThan(SEARCH_RANK_WEIGHTS.location);
    expect(SEARCH_RANK_WEIGHTS.location).toBeGreaterThan(SEARCH_RANK_WEIGHTS.description);
  });

  it("builds FTS + trigram SQL without jsonb lower", () => {
    const rank = buildHybridRankSql("$1");
    const where = buildHybridWhereSql("$1");

    expect(rank).toContain('similarity("title"');
    expect(rank).toContain("searchVector");
    expect(where).toContain("ILIKE");
    expect(where).toContain("plainto_tsquery");
    expect(rank.toLowerCase()).not.toContain("jsonb");
    expect(where.toLowerCase()).not.toContain("lower(jsonb");
  });
});
