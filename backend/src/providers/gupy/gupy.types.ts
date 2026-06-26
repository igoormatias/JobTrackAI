export type GupyWorkplaceType = "on-site" | "hybrid" | "remote";

export type GupyRawJob = {
  jobUrl: string;
  name: string;
  careerPageName: string;
  city?: string;
  state?: string;
  workplaceType?: GupyWorkplaceType;
  type?: string;
  disabilities?: boolean;
  publishedDate?: string;
};

export type GupyApiResponse = {
  data: GupyRawJob[];
};
