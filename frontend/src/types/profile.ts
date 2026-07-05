import type { Skill } from "./skill";
import type { Technology } from "./technology";

export type ProfessionalArea =
  | "frontend"
  | "backend"
  | "full_stack"
  | "mobile"
  | "qa"
  | "devops"
  | "ux_ui"
  | "product_owner"
  | "product_manager"
  | "scrum_master"
  | "tech_lead"
  | "data_analyst"
  | "data_engineer"
  | "business_analyst"
  | "agile_coach"
  | "other";

export type Seniority =
  | "intern"
  | "junior"
  | "mid"
  | "senior"
  | "specialist"
  | "lead"
  | "staff";

export type WorkModality = "remote" | "hybrid" | "onsite" | "any";

export type SalaryRange = {
  min: number;
  max: number;
  currency: "BRL";
};

export type SalaryBand = "up_to_5k" | "5k_8k" | "8k_12k" | "12k_15k" | "15k_plus";

export type ProfileLocationScope = "country" | "state" | "city";

export type ProfileLocation = {
  scope: ProfileLocationScope;
  state?: string;
  city?: string;
  acceptsRelocation: boolean;
};

export type OnboardingStepId =
  | "area"
  | "skills"
  | "seniority"
  | "modality"
  | "location"
  | "salary"
  | "calendar"
  | "summary";

export type OnboardingProgress = {
  currentStep: OnboardingStepId;
  lastSavedAt: string;
};

/** Reserved for future profile fields (languages, certifications, portfolio, etc.) */
export type ProfileExtensions = Record<string, unknown>;

export type Profile = {
  id: string;
  userId: string;
  headline: string;
  area: ProfessionalArea | null;
  seniority: Seniority | null;
  modality: WorkModality | null;
  location: string;
  locationPreference: ProfileLocation | null;
  salaryExpectation: SalaryRange | null;
  salaryBand: SalaryBand | null;
  skills: Skill[];
  skillNames: string[];
  technologies: Technology[];
  avoidedTechnologies: Technology[];
  bio: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  onboardingProgress: OnboardingProgress | null;
  onboardingCompleted: boolean;
  extensions: ProfileExtensions;
  updatedAt: string;
};

export type AccountUser = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type AccountProfile = Profile & {
  user: AccountUser;
};

export type CreateProfilePayload = {
  area?: ProfessionalArea | null;
  seniority?: Seniority | null;
  modality?: WorkModality | null;
  location?: string;
  locationPreference?: ProfileLocation | null;
  salaryBand?: SalaryBand | null;
  salaryExpectation?: SalaryRange | null;
  skillNames?: string[];
  onboardingProgress?: OnboardingProgress | null;
  onboardingCompleted?: boolean;
  headline?: string;
  bio?: string;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  extensions?: ProfileExtensions;
};

export type UpdateProfilePayload = Partial<
  Pick<
    Profile,
    | "headline"
    | "area"
    | "seniority"
    | "modality"
    | "location"
    | "locationPreference"
    | "salaryExpectation"
    | "salaryBand"
    | "skillNames"
    | "skills"
    | "technologies"
    | "avoidedTechnologies"
    | "bio"
    | "linkedinUrl"
    | "githubUrl"
    | "onboardingProgress"
    | "onboardingCompleted"
    | "extensions"
  >
>;
