import { describe, expect, it } from "vitest";

import { SkillNormalizer } from "../../domain/services/skill-normalizer.service.js";
import type { SkillRecord } from "../../domain/entities/career-analysis.entity.js";
import type { SkillCatalogRepository } from "../../domain/repositories/skill-catalog.repository.js";
import { NormalizeSkillsUseCase, SearchSkillsCatalogUseCase } from "./skills.use-cases.js";

const reactSkill: SkillRecord = {
  id: "1",
  slug: "react",
  name: "React",
  status: "OFFICIAL",
  area: "frontend",
};

class InMemorySkillCatalog implements SkillCatalogRepository {
  constructor(private readonly skills: SkillRecord[] = [reactSkill]) {}

  async findBySlug(slug: string) {
    return this.skills.find((skill) => skill.slug === slug) ?? null;
  }

  async findByAlias(aliasSlug: string) {
    if (aliasSlug === "reactjs") return reactSkill;
    return null;
  }

  async createCustom(name: string, slug: string) {
    return { id: slug, slug, name, status: "CUSTOM" as const, area: null };
  }

  async listAliases() {
    return [];
  }

  async search(query: string) {
    const q = query.toLowerCase();
    return this.skills.filter(
      (skill) => skill.name.toLowerCase().includes(q) || skill.slug.includes(q),
    );
  }
}

describe("skills use cases", () => {
  it("searches catalog skills", async () => {
    const catalog = new InMemorySkillCatalog();
    const useCase = new SearchSkillsCatalogUseCase(catalog);
    const result = await useCase.execute("rea");
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("React");
  });

  it("normalizes skill aliases", async () => {
    const catalog = new InMemorySkillCatalog();
    const useCase = new NormalizeSkillsUseCase(catalog, new SkillNormalizer(catalog));
    const result = await useCase.execute(["ReactJS", "react"]);
    expect(result.skills).toHaveLength(2);
    expect(result.skills.every((skill) => skill.slug === "react")).toBe(true);
  });
});
