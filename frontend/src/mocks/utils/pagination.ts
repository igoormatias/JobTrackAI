import type { CursorPaginatedResponse, CursorPaginationMeta } from "@/types";

type CursorPayload = {
  lastId: string;
  sortValue: string | number;
};

export const encodeCursor = (payload: CursorPayload): string =>
  btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export const decodeCursor = (cursor: string): CursorPayload | null => {
  try {
    const padded = cursor.padEnd(cursor.length + ((4 - (cursor.length % 4)) % 4), "=");
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as CursorPayload;
  } catch {
    return null;
  }
};

export const paginateWithCursor = <T>(
  items: T[],
  {
    cursor,
    limit = 20,
    getId,
    getSortValue,
  }: {
    cursor?: string;
    limit?: number;
    getId: (item: T) => string;
    getSortValue: (item: T) => string | number;
  },
): CursorPaginatedResponse<T> => {
  let startIndex = 0;

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const foundIndex = items.findIndex((item) => getId(item) === decoded.lastId);
      startIndex = foundIndex >= 0 ? foundIndex + 1 : 0;
    }
  }

  const pageItems = items.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < items.length;
  const lastItem = pageItems[pageItems.length - 1];

  const meta: CursorPaginationMeta = {
    limit,
    total: items.length,
    hasMore,
    nextCursor:
      hasMore && lastItem
        ? encodeCursor({ lastId: getId(lastItem), sortValue: getSortValue(lastItem) })
        : null,
  };

  return { data: pageItems, meta };
};
