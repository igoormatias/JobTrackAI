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

  it("buildJobWithSalaryFilter matches jobs with any salary field", () => {
    expect(buildJobWithSalaryFilter()).toEqual({
      OR: [{ salaryMin: { not: null } }, { salaryMax: { not: null } }],
    });
  });
});
