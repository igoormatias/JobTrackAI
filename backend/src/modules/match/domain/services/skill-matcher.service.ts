import {
  canonicalizeSkill,
  canonicalizeSkills,
  skillsMatch,
} from "../../../../shared/domain/skill-normalization.js";

export class SkillMatcher {
  canonicalize(name: string): string {
    return canonicalizeSkill(name);
  }

  canonicalizeMany(names: string[]): string[] {
    return canonicalizeSkills(names);
  }

  matches(profileSkill: string, jobTerm: string): boolean {
    return skillsMatch(profileSkill, jobTerm);
  }

  findMatches(profileSkills: string[], jobTerms: string[]): string[] {
    const matched: string[] = [];
    for (const skill of profileSkills) {
      const hit = jobTerms.some((term) => this.matches(skill, term));
      if (hit) matched.push(skill);
    }
    return matched;
  }

  profileHasTerm(profileSkills: string[], jobTerm: string): boolean {
    return profileSkills.some((skill) => this.matches(skill, jobTerm));
  }
}

export const skillMatcher = new SkillMatcher();
