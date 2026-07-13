import type { ProfessionalArea } from "../../../profiles/domain/entities/profile.entity.js";

const normalizeTitle = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

/** Title aliases grouped by professional area (longest match wins). */
const TITLE_ALIASES_BY_AREA: Record<string, string[]> = {
  frontend: [
    "software engineer frontend",
    "web frontend engineer",
    "front end engineer",
    "front-end engineer",
    "frontend engineer",
    "front end developer",
    "front-end developer",
    "frontend developer",
    "react engineer",
    "react developer",
    "ui engineer",
    "desenvolvedor frontend",
    "desenvolvedor front end",
    "desenvolvedor front-end",
    "desenvolvedor react",
    "desenvolvedora react",
    "pessoa desenvolvedora frontend",
    "pessoa desenvolvedora react",
    "programador frontend",
    "programador react",
    "engenheiro frontend",
    "dev frontend",
    "dev react",
  ],
  backend: [
    "python backend developer",
    "software engineer backend",
    "nestjs developer",
    "node.js developer",
    "node developer",
    "java developer",
    "c# developer",
    "backend engineer",
    "backend developer",
    "desenvolvedor backend",
    "desenvolvedor back end",
    "desenvolvedor back-end",
    "desenvolvedor node",
    "desenvolvedor java",
    "desenvolvedora backend",
    "pessoa desenvolvedora backend",
    "programador backend",
    "engenheiro backend",
    "dev backend",
  ],
  full_stack: [
    "full stack",
    "fullstack",
    "full-stack",
    "software engineer",
    "software developer",
    "desenvolvedor full stack",
    "desenvolvedor fullstack",
    "desenvolvedor full-stack",
    "pessoa desenvolvedora full stack",
    "programador full stack",
    "engenheiro de software",
    "desenvolvedor de software",
  ],
  mobile: [
    "react native",
    "mobile engineer",
    "flutter",
    "android",
    "ios",
    "desenvolvedor mobile",
    "desenvolvedor android",
    "desenvolvedor ios",
    "desenvolvedor flutter",
    "desenvolvedor react native",
  ],
  devops: [
    "site reliability engineer",
    "cloud infrastructure",
    "infrastructure engineer",
    "platform engineer",
    "cloud engineer",
    "devops engineer",
    "sre",
    "engenheiro devops",
    "desenvolvedor devops",
  ],
  qa: [
    "quality assurance",
    "automation engineer",
    "test engineer",
    "qa analyst",
    "qa engineer",
    "analista de qualidade",
    "analista qa",
  ],
  product_owner: ["product owner", "product owner", "po "],
  product_manager: [
    "technical product manager",
    "product manager",
    "gerente de produto",
  ],
  scrum_master: ["scrum master"],
  agile_coach: ["agile coach"],
};

const FRONTEND_TECH_TOKENS = ["react", "vue", "angular", "next", "frontend", "front end"];
const BACKEND_TECH_TOKENS = ["node", "java", "python", "dotnet", ".net", "nestjs", "spring", "backend"];
const MOBILE_TECH_TOKENS = ["react native", "flutter", "android", "ios", "kotlin", "swift"];
const DEV_ROLE_TOKENS = ["desenvolvedor", "desenvolvedora", "programador", "programadora", "engenheiro", "dev"];

type AliasEntry = { area: ProfessionalArea; alias: string };

const SORTED_ALIASES: AliasEntry[] = Object.entries(TITLE_ALIASES_BY_AREA)
  .flatMap(([area, aliases]) =>
    aliases.map((alias) => ({ area: area as ProfessionalArea, alias: normalizeTitle(alias) })),
  )
  .sort((a, b) => b.alias.length - a.alias.length);

export const getTitleSearchHintsForArea = (area: ProfessionalArea | null | undefined): string[] => {
  if (!area) return [];
  return TITLE_ALIASES_BY_AREA[area] ?? [];
};

export class JobTitleNormalizer {
  normalizeTitle(title: string): string {
    return normalizeTitle(title);
  }

  inferArea(title: string): ProfessionalArea | null {
    if (!title?.trim()) return null;
    const normalized = normalizeTitle(title);
    if (!normalized) return null;

    for (const entry of SORTED_ALIASES) {
      if (normalized.includes(entry.alias)) {
        return entry.area;
      }
    }

    const hasDevRole = DEV_ROLE_TOKENS.some((token) => normalized.includes(token));
    if (hasDevRole) {
      if (MOBILE_TECH_TOKENS.some((token) => normalized.includes(token))) return "mobile";
      if (FRONTEND_TECH_TOKENS.some((token) => normalized.includes(token))) return "frontend";
      if (BACKEND_TECH_TOKENS.some((token) => normalized.includes(token))) return "backend";
    }

    return null;
  }
}

export const jobTitleNormalizer = new JobTitleNormalizer();
