export type CursorPaginationMeta = {
  limit: number;
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
};

export type CursorPaginatedResult<T> = {
  data: T[];
  meta: CursorPaginationMeta;
};

type CursorPayload = {
  lastId: string;
  sortValue: string | number;
};

export const encodeCursor = (payload: CursorPayload): string =>
  Buffer.from(JSON.stringify(payload)).toString("base64url");

export const decodeCursor = (cursor: string): CursorPayload | null => {
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as CursorPayload;
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
): CursorPaginatedResult<T> => {
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

  return {
    data: pageItems,
    meta: {
      limit,
      total: items.length,
      hasMore,
      nextCursor:
        hasMore && lastItem
          ? encodeCursor({ lastId: getId(lastItem), sortValue: getSortValue(lastItem) })
          : null,
    },
  };
};
