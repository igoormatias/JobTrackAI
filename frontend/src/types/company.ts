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
