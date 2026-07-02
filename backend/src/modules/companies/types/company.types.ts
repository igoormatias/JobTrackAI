export type CompanySize = "startup" | "small" | "medium" | "large" | "enterprise";

export type Company = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  industry: string;
  size: CompanySize;
  location: string;
  jobCount: number;
};

export type CompanyListParams = {
  cursor?: string;
  limit?: number;
  q?: string;
};

export type CompanyListResult = {
  data: Company[];
  meta: {
    limit: number;
    total: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
};
