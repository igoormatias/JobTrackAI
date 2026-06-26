import { describe, expect, it } from "vitest";

import { paginateWithCursor } from "./pagination";

type Item = { id: string; value: number };

const items: Item[] = Array.from({ length: 5 }, (_, index) => ({
  id: `item_${index + 1}`,
  value: index + 1,
}));

describe("paginateWithCursor", () => {
  it("returns first page with next cursor", () => {
    const page = paginateWithCursor(items, {
      limit: 2,
      getId: (item) => item.id,
      getSortValue: (item) => item.value,
    });

    expect(page.data).toHaveLength(2);
    expect(page.meta.total).toBe(5);
    expect(page.meta.hasMore).toBe(true);
    expect(page.meta.nextCursor).toBeTruthy();
  });

  it("returns next page using cursor", () => {
    const firstPage = paginateWithCursor(items, {
      limit: 2,
      getId: (item) => item.id,
      getSortValue: (item) => item.value,
    });

    const secondPage = paginateWithCursor(items, {
      cursor: firstPage.meta.nextCursor ?? undefined,
      limit: 2,
      getId: (item) => item.id,
      getSortValue: (item) => item.value,
    });

    expect(secondPage.data[0]?.id).toBe("item_3");
  });
});
