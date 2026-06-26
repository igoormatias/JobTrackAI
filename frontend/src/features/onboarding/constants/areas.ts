import type { ProfessionalArea } from "@/types";

export type AreaOption = {
  value: ProfessionalArea;
  label: string;
  icon:
    | "monitor"
    | "server"
    | "layers"
    | "smartphone"
    | "bug"
    | "cloud"
    | "palette"
    | "clipboard"
    | "chart"
    | "users"
    | "crown"
    | "database"
    | "barChart"
    | "briefcase"
    | "sparkles"
    | "more";
};

export const AREA_OPTIONS: AreaOption[] = [
  { value: "frontend", label: "Frontend", icon: "monitor" },
  { value: "backend", label: "Backend", icon: "server" },
  { value: "full_stack", label: "Full Stack", icon: "layers" },
  { value: "mobile", label: "Mobile", icon: "smartphone" },
  { value: "qa", label: "QA", icon: "bug" },
  { value: "devops", label: "DevOps", icon: "cloud" },
  { value: "ux_ui", label: "UX/UI", icon: "palette" },
  { value: "product_owner", label: "Product Owner", icon: "clipboard" },
  { value: "product_manager", label: "Product Manager", icon: "chart" },
  { value: "scrum_master", label: "Scrum Master", icon: "users" },
  { value: "tech_lead", label: "Tech Lead", icon: "crown" },
  { value: "data_analyst", label: "Data Analyst", icon: "barChart" },
  { value: "data_engineer", label: "Data Engineer", icon: "database" },
  { value: "business_analyst", label: "Business Analyst", icon: "briefcase" },
  { value: "agile_coach", label: "Agile Coach", icon: "sparkles" },
  { value: "other", label: "Outro", icon: "more" },
];
