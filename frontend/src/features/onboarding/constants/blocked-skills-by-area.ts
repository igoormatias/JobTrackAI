import type { ProfessionalArea } from "@/types";

const COMMON_BLOCKED_SKILLS = ["Flutter", "SAP", "Salesforce", "Cobol", "ABAP", "PHP", "WordPress"];

export const BLOCKED_SKILLS_BY_AREA: Record<ProfessionalArea, string[]> = {
  frontend: [...COMMON_BLOCKED_SKILLS, "Java", "Spring", "Mainframe"],
  backend: [...COMMON_BLOCKED_SKILLS, "WordPress", "Drupal", "SharePoint"],
  full_stack: COMMON_BLOCKED_SKILLS,
  mobile: ["SAP", "Salesforce", "Cobol", "ABAP", "WordPress", "Mainframe"],
  qa: COMMON_BLOCKED_SKILLS,
  devops: COMMON_BLOCKED_SKILLS,
  ux_ui: ["SAP", "Cobol", "ABAP", "Mainframe", "Backend"],
  product_owner: COMMON_BLOCKED_SKILLS,
  product_manager: COMMON_BLOCKED_SKILLS,
  scrum_master: COMMON_BLOCKED_SKILLS,
  tech_lead: COMMON_BLOCKED_SKILLS,
  data_analyst: COMMON_BLOCKED_SKILLS,
  data_engineer: COMMON_BLOCKED_SKILLS,
  business_analyst: COMMON_BLOCKED_SKILLS,
  agile_coach: COMMON_BLOCKED_SKILLS,
  other: COMMON_BLOCKED_SKILLS,
};

export const getBlockedSkillsForArea = (area: ProfessionalArea | ""): string[] => {
  if (!area) return COMMON_BLOCKED_SKILLS;
  return BLOCKED_SKILLS_BY_AREA[area] ?? COMMON_BLOCKED_SKILLS;
};
