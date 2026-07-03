export type NormalizedJob = {
  title: string;
  company: string;
  description: string;
  technologies: string[];
  seniority?: string | null;
  modality?: string | null;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  sourceUrl: string;
  provider: string;
  publishedAt: Date;
  contentHash: string;
  externalId: string;
};
