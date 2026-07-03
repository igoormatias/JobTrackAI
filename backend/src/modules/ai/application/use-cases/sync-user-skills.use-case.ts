import type { SkillCatalogRepository, UserSkillRepository } from "../../domain/repositories/skill-catalog.repository.js";
import { SkillNormalizer } from "../../domain/services/skill-normalizer.service.js";
import { slugifySkill } from "../../domain/services/skill-slug.service.js";

export class SyncUserSkillsUseCase {
  constructor(
    private readonly catalogRepo: SkillCatalogRepository,
    private readonly userSkillRepo: UserSkillRepository,
    private readonly normalizer: SkillNormalizer,
  ) {}

  async execute(userId: string, skillNames: string[]): Promise<void> {
    const uniqueNames = [...new Set(skillNames.map((name) => name.trim()).filter(Boolean))];
    const skillIds: string[] = [];

    for (const name of uniqueNames) {
      const slug = await this.normalizer.resolveSlug(name);
      let skill = await this.catalogRepo.findBySlug(slug);
      if (!skill) {
        skill = await this.catalogRepo.createCustom(name, slugifySkill(name));
      }
      skillIds.push(skill.id);
    }

    await this.userSkillRepo.upsertMany(
      userId,
      skillIds.map((skillId) => ({
        skillId,
        level: "INTERMEDIATE",
        status: "OFFICIAL",
      })),
    );

    await this.userSkillRepo.deleteNotInSkillIds(userId, skillIds);
  }
}
