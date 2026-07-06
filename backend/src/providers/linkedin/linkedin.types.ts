export type LinkedinRawJob = {
  title: string;
  company: string;
  sourceUrl: string;
  externalId: string;
  location?: string;
  publishedDate?: string;
  modality?: string | null;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
};
