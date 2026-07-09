import { SkillNormalizer } from "../../domain/services/skill-normalizer.service.js";
import type { SkillCatalogRepository } from "../../domain/repositories/skill-catalog.repository.js";

export class SearchSkillsCatalogUseCase {
  constructor(private readonly catalog: SkillCatalogRepository) {}

  async execute(query: string, limit = 20) {
    const skills = await this.catalog.search(query, limit);
    return skills.map((skill) => ({ id: skill.id, name: skill.name, slug: skill.slug }));
  }
}

export class NormalizeSkillsUseCase {
  constructor(
    private readonly catalog: SkillCatalogRepository,
    private readonly normalizer: SkillNormalizer,
  ) {}

  async execute(skillNames: string[]) {
    const unique = [...new Set(skillNames.map((name) => name.trim()).filter(Boolean))];
    const skills = await Promise.all(
      unique.map(async (raw) => {
        const slug = await this.normalizer.resolveSlug(raw);
        const record = await this.catalog.findBySlug(slug);
        return {
          input: raw,
          name: record?.name ?? raw,
          slug,
        };
      }),
    );
    return { skills };
  }
}
