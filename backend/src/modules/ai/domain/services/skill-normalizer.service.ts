import type { SkillCatalogRepository } from "../repositories/skill-catalog.repository.js";
import { slugifySkill } from "./skill-slug.service.js";

export type NormalizedSkillMatch = {
  matched: string[];
  missing: string[];
  userSkillSlugs: string[];
};

export class SkillNormalizer {
  constructor(private readonly catalog: SkillCatalogRepository) {}

  async resolveSlug(rawName: string): Promise<string> {
    const slug = slugifySkill(rawName);
    const bySlug = await this.catalog.findBySlug(slug);
    if (bySlug) return bySlug.slug;

    const compact = slug.replace(/-/g, "");
    const byAlias = await this.catalog.findByAlias(compact);
    if (byAlias) return byAlias.slug;

    const byAliasSlug = await this.catalog.findByAlias(slug);
    if (byAliasSlug) return byAliasSlug.slug;

    return slug;
  }

  async compare(userSkillNames: string[], jobTechnologyNames: string[]): Promise<NormalizedSkillMatch> {
    const userSlugs = [...new Set(await Promise.all(userSkillNames.map((name) => this.resolveSlug(name))))];
    const jobSlugs = [...new Set(await Promise.all(jobTechnologyNames.map((name) => this.resolveSlug(name))))];

    const userSet = new Set(userSlugs);
    const matched = jobSlugs.filter((slug) => userSet.has(slug));
    const missing = jobSlugs.filter((slug) => !userSet.has(slug));

    return { matched, missing, userSkillSlugs: userSlugs };
  }
}
