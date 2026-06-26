import type { Skill } from "./skill";
import type { Technology } from "./technology";

export type ProfessionalArea =
  | "frontend"
  | "backend"
  | "full_stack"
  | "qa"
  | "devops"
  | "product_owner"
  | "product_manager"
  | "scrum_master"
  | "ux_ui"
  | "data_engineer"
  | "data_analyst"
  | "tech_lead";

export type Seniority = "intern" | "junior" | "mid" | "senior" | "lead" | "staff";

export type WorkModality = "remote" | "hybrid" | "onsite";

export type SalaryRange = {
  min: number;
  max: number;
  currency: "BRL";
};

export type Profile = {
  id: string;
  userId: string;
  headline: string;
  area: ProfessionalArea;
  seniority: Seniority;
  modality: WorkModality;
  location: string;
  salaryExpectation: SalaryRange;
  skills: Skill[];
  technologies: Technology[];
  avoidedTechnologies: Technology[];
  bio: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  updatedAt: string;
};

export type UpdateProfilePayload = Partial<
  Pick<
    Profile,
    | "headline"
    | "area"
    | "seniority"
    | "modality"
    | "location"
    | "salaryExpectation"
    | "skills"
    | "technologies"
    | "avoidedTechnologies"
    | "bio"
    | "linkedinUrl"
    | "githubUrl"
  >
>;
