import type { Company } from "./company";
import type { MatchScore } from "./match";
import type { ProfessionalArea, Seniority, WorkModality } from "./profile";
import type { Technology } from "./technology";

export type JobSource = "gupy" | "linkedin" | "programathor" | "internal";

export type JobStatus = "active" | "closed" | "expired";

export type JobEngagementState = "new" | "viewed" | "favorited" | "applied" | "rejected";

export type Job = {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  company: Pick<Company, "id" | "name" | "slug" | "logoUrl">;
  area: ProfessionalArea;
  seniority: Seniority;
  modality: WorkModality;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: "BRL";
  description: string;
  requirements: string[];
  benefits: string[];
  technologies: Technology[];
  source: JobSource;
  sourceUrl: string;
  status: JobStatus;
  isFavorite: boolean;
  engagementState: JobEngagementState;
  matchScore: MatchScore;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};
