import type { ProfessionalArea } from "@/types";

export const COMPANIES_BY_AREA: Record<ProfessionalArea, string[]> = {
  frontend: ["Nubank", "Stone", "iFood", "CI&T", "XP Inc.", "Hotmart"],
  backend: ["Nubank", "Stone", "Mercado Livre", "iFood", "CI&T", "XP Inc."],
  full_stack: ["Nubank", "Stone", "iFood", "Mercado Livre", "Hotmart", "CI&T"],
  mobile: ["Nubank", "iFood", "Mercado Livre", "Stone", "PicPay", "Hotmart"],
  qa: ["CI&T", "Nubank", "Stone", "Mercado Livre", "iFood", "Hotmart"],
  devops: ["Nubank", "Stone", "Mercado Livre", "XP Inc.", "CI&T", "iFood"],
  ux_ui: ["Nubank", "QuintoAndar", "iFood", "Hotmart", "Loft", "Mercado Livre"],
  product_owner: ["QuintoAndar", "Loft", "PicPay", "Mercado Livre", "Nubank", "Hotmart"],
  product_manager: ["QuintoAndar", "Loft", "Mercado Livre", "Nubank", "iFood", "Hotmart"],
  scrum_master: ["CI&T", "Nubank", "Stone", "Mercado Livre", "QuintoAndar", "Loft"],
  tech_lead: ["Nubank", "Stone", "Mercado Livre", "CI&T", "XP Inc.", "iFood"],
  data_analyst: ["Nubank", "Mercado Livre", "Stone", "XP Inc.", "Hotmart", "iFood"],
  data_engineer: ["Nubank", "Mercado Livre", "Stone", "XP Inc.", "CI&T", "iFood"],
  business_analyst: ["QuintoAndar", "Loft", "Mercado Livre", "Nubank", "Stone", "B3"],
  agile_coach: ["CI&T", "Nubank", "Stone", "QuintoAndar", "Loft", "Mercado Livre"],
  other: ["Nubank", "Stone", "Mercado Livre", "iFood", "CI&T", "Hotmart"],
};

export const getPriorityCompaniesForArea = (area: ProfessionalArea | null): string[] => {
  if (!area) return COMPANIES_BY_AREA.frontend;
  return COMPANIES_BY_AREA[area] ?? COMPANIES_BY_AREA.other;
};
