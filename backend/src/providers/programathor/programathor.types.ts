export type ProgramathorRawJob = {
  title: string;
  company: string;
  url: string;
  location?: string;
  tags?: string[];
  seniority?: string | null;
  modality?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  description?: string;
  descriptionHtml?: string | null;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  publishedAt?: string;
  externalId: string;
};
