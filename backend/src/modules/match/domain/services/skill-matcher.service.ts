import { slugifySkill } from "../../../../shared/domain/skill-slug.js";

/** Alias slug → canonical slug for synchronous match scoring. */
const SKILL_ALIAS_TO_CANONICAL: Record<string, string> = {
  reactjs: "react",
  "react-js": "react",
  nodejs: "node-js",
  "node-js": "node-js",
  ts: "typescript",
  js: "javascript",
  nextjs: "next-js",
  "next-js": "next-js",
  vuejs: "vue",
  angularjs: "angular",
};

export class SkillMatcher {
  canonicalize(name: string): string {
    const slug = slugifySkill(name);
    return SKILL_ALIAS_TO_CANONICAL[slug] ?? slug;
  }

  canonicalizeMany(names: string[]): string[] {
    return [...new Set(names.map((name) => this.canonicalize(name)))];
  }

  matches(profileSkill: string, jobTerm: string): boolean {
    const profileSlug = this.canonicalize(profileSkill);
    const jobSlug = this.canonicalize(jobTerm);
    if (!profileSlug || !jobSlug) return false;
    if (profileSlug === jobSlug) return true;
    return profileSlug.includes(jobSlug) || jobSlug.includes(profileSlug);
  }

  findMatches(profileSkills: string[], jobTerms: string[]): string[] {
    const matched: string[] = [];
    for (const skill of profileSkills) {
      const hit = jobTerms.some((term) => this.matches(skill, term));
      if (hit) matched.push(skill);
    }
    return matched;
  }
}

export const skillMatcher = new SkillMatcher();
