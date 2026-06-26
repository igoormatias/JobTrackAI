import type { OnboardingCompletePayload } from "@/features/auth/types";

export type OnboardingStep =
  | "area"
  | "seniority"
  | "modality"
  | "location"
  | "salary"
  | "skills";

export type OnboardingFormState = OnboardingCompletePayload;

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "area",
  "seniority",
  "modality",
  "location",
  "salary",
  "skills",
];

export const AREA_OPTIONS = [
  { value: "frontend", label: "Frontend", icon: "monitor" },
  { value: "backend", label: "Backend", icon: "server" },
  { value: "full_stack", label: "Full Stack", icon: "layers" },
  { value: "qa", label: "QA", icon: "bug" },
  { value: "devops", label: "DevOps", icon: "cloud" },
  { value: "ux_ui", label: "UX/UI", icon: "palette" },
  { value: "product_owner", label: "Product Owner", icon: "clipboard" },
  { value: "product_manager", label: "Product Manager", icon: "chart" },
  { value: "tech_lead", label: "Tech Lead", icon: "crown" },
] as const;

export const SENIORITY_OPTIONS = [
  { value: "intern", label: "Estágio" },
  { value: "junior", label: "Júnior" },
  { value: "mid", label: "Pleno" },
  { value: "senior", label: "Sênior" },
  { value: "lead", label: "Lead" },
  { value: "staff", label: "Staff" },
] as const;

export const MODALITY_OPTIONS = [
  { value: "remote", label: "Remoto" },
  { value: "hybrid", label: "Híbrido" },
  { value: "onsite", label: "Presencial" },
] as const;

export const SKILL_OPTIONS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "Docker",
  "AWS",
  "PostgreSQL",
  "GraphQL",
  "Figma",
] as const;
