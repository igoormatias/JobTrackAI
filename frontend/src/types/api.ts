export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type CursorPaginationMeta = {
  limit: number;
  total: number;
  nextCursor: string | null;
  hasMore: boolean;
  jobsWithSalary?: number;
  salaryCoverageRatio?: number;
};

export type CursorPaginatedResponse<T> = {
  data: T[];
  meta: CursorPaginationMeta;
};

export type SortDirection = "asc" | "desc";

export type JobSortField = "recent" | "match" | "date" | "salary" | "title" | "company" | "priority";
