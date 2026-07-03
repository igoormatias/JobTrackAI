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
  ],
  full_stack: [
    "full stack",
    "fullstack",
    "full-stack",
    "software engineer",
    "software developer",
  ],
  mobile: [
    "react native",
    "mobile engineer",
    "flutter",
    "android",
    "ios",
  ],
  devops: [
    "site reliability engineer",
    "cloud infrastructure",
    "infrastructure engineer",
    "platform engineer",
    "cloud engineer",
    "devops engineer",
    "sre",
  ],
  qa: [
    "quality assurance",
    "automation engineer",
    "test engineer",
    "qa analyst",
    "qa engineer",
  ],
  product_owner: ["product owner"],
  product_manager: [
    "technical product manager",
    "product manager",
  ],
  scrum_master: ["scrum master"],
  agile_coach: ["agile coach"],
};

type AliasEntry = { area: ProfessionalArea; alias: string };

const SORTED_ALIASES: AliasEntry[] = Object.entries(TITLE_ALIASES_BY_AREA)
  .flatMap(([area, aliases]) =>
    aliases.map((alias) => ({ area: area as ProfessionalArea, alias: normalizeTitle(alias) })),
  )
  .sort((a, b) => b.alias.length - a.alias.length);

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

    return null;
  }
}

export const jobTitleNormalizer = new JobTitleNormalizer();
