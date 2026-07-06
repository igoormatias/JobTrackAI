export type GupyWorkplaceType = "on-site" | "hybrid" | "remote";

export type GupyRawJob = {
  id?: number;
  jobUrl: string;
  careerPageUrl?: string;
  name: string;
  careerPageName: string;
  careerPageId?: number;
  city?: string;
  state?: string;
  country?: string;
  workplaceType?: GupyWorkplaceType;
  type?: string;
  disabilities?: boolean;
  publishedDate?: string;
  description?: string;
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
};

export type GupyApiResponse = {
  data: GupyRawJob[];
};
