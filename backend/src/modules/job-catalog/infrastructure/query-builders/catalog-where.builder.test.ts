import { describe, expect, it } from "vitest";

import {
  buildCatalogWhere,
  buildJobWithoutSalaryFilter,
  buildJobWithSalaryFilter,
} from "./catalog-where.builder.js";

describe("catalog-where.builder", () => {
  it("builds catalog visibility filter for user", () => {
    const where = buildCatalogWhere({ userId: "user_1", areas: ["frontend"] });

    expect(where.AND).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          AND: [
            { OR: [{ isCatalog: true }, { userId: "user_1" }] },
            expect.objectContaining({
              status: "active",
              OR: expect.arrayContaining([
                { expiresAt: null },
                expect.objectContaining({ expiresAt: expect.any(Object) }),
              ]),
            }),
          ],
        }),
        { area: { in: ["frontend"] } },
      ]),
    );
  });

  it("includes jobs without salary when salaryMin filter is active", () => {
    const where = buildCatalogWhere({ userId: "user_1", salaryMin: 8000 });

    expect(where.AND).toEqual(
      expect.arrayContaining([
        {
          OR: [buildJobWithoutSalaryFilter(), { salaryMax: { gte: 8000 } }],
        },
      ]),
    );
  });

  it("ignores salaryMin of zero", () => {
    const withZero = buildCatalogWhere({ userId: "user_1", salaryMin: 0 });
    const without = buildCatalogWhere({ userId: "user_1" });

    expect(withZero.AND?.length).toBe(without.AND?.length);
  });

  it("builds text search without JSONB string_contains", () => {
    const where = buildCatalogWhere({ userId: "user_1", q: "React" });
    const and = where.AND as unknown[];
    const textFilter = and.find(
      (clause) =>
        clause &&
        typeof clause === "object" &&
        "OR" in (clause as Record<string, unknown>),
    ) as { OR: unknown[] } | undefined;

    expect(textFilter?.OR).toEqual(
      expect.arrayContaining([
        { title: { contains: "React", mode: "insensitive" } },
        { companyName: { contains: "React", mode: "insensitive" } },
        { searchText: { contains: "React", mode: "insensitive" } },
        { technologyText: { contains: "React", mode: "insensitive" } },
      ]),
    );
    expect(JSON.stringify(textFilter)).not.toContain("string_contains");
    expect(JSON.stringify(textFilter)).not.toContain("metadata");
  });

  it("builds skill filters without JSONB string_contains", () => {
    const where = buildCatalogWhere({ userId: "user_1", skills: ["TypeScript"] });
    expect(JSON.stringify(where)).not.toContain("string_contains");
    expect(JSON.stringify(where)).not.toContain('"metadata"');
  });
});
