export type ExternalJobRef = {
  provider: "gupy" | "linkedin" | "programathor";
  externalId: string;
  url: string;
  dedupKey?: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};
