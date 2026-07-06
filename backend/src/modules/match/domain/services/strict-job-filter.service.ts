import {
  isAreaCompatible,
  type MatchJobInput,
  type MatchProfileInput,
} from "./match-engine.service.js";

const TECH_AREAS = new Set([
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "devops",
  "data",
  "qa",
]);

const INCOMPATIBLE_TITLE_PATTERNS: RegExp[] = [
  /cr[eé]dito/i,
  /\bsuporte\b/i,
  /administrativ/i,
  /\brh\b|recursos humanos/i,
  /vendas|comercial/i,
];

const SENIORITY_RANK: Record<string, number> = {
  intern: 0,
  junior: 1,
  mid: 2,
  senior: 3,
  specialist: 4,
  lead: 5,
  staff: 6,
};

export const passesStrictProfileMatch = (
  profile: MatchProfileInput,
  job: MatchJobInput,
): boolean => {
  if (!isAreaCompatible(profile, job)) {
    const titleLower = (job.title ?? "").toLowerCase();
    const hasSkillInTitle = profile.skillNames.some((skill) =>
      titleLower.includes(skill.toLowerCase()),
    );
    if (!hasSkillInTitle) return false;
  }

  if (profile.area && TECH_AREAS.has(profile.area)) {
    const title = job.title ?? "";
    if (INCOMPATIBLE_TITLE_PATTERNS.some((pattern) => pattern.test(title))) {
      return false;
    }
  }

  if (profile.seniority && job.seniority) {
    const profileRank = SENIORITY_RANK[profile.seniority] ?? 2;
    const jobRank = SENIORITY_RANK[job.seniority] ?? 2;
    if (profileRank >= (SENIORITY_RANK.senior ?? 3) && jobRank <= (SENIORITY_RANK.intern ?? 0)) {
      return false;
    }
  }

  return true;
};
