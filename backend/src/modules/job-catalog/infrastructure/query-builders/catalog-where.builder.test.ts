import { describe, expect, it } from "vitest";

import { buildCatalogWhere, decodeCursor, encodeCursor } from "./catalog-where.builder.js";

describe("catalog-where.builder", () => {
  it("builds catalog visibility filter for user", () => {
    const where = buildCatalogWhere({ userId: "user_1", areas: ["frontend"] });

    expect(where.AND).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          OR: [{ isCatalog: true }, { userId: "user_1" }],
          status: "active",
        }),
        { area: { in: ["frontend"] } },
      ]),
    );
  });

  it("encodes and decodes cursor", () => {
    const publishedAt = new Date("2026-07-01T12:00:00.000Z");
    const cursor = encodeCursor(publishedAt, "job_0001");
    const decoded = decodeCursor(cursor);

    expect(decoded?.id).toBe("job_0001");
    expect(decoded?.publishedAt.toISOString()).toBe(publishedAt.toISOString());
  });
});
