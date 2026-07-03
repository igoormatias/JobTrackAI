import { describe, expect, it } from "vitest";

import type { SkillCatalogRepository } from "../repositories/skill-catalog.repository.js";
import type { SkillRecord } from "../entities/career-analysis.entity.js";
import { SkillNormalizer } from "./skill-normalizer.service.js";

const createCatalog = (skills: SkillRecord[], aliases: Record<string, string> = {}): SkillCatalogRepository => ({
  findBySlug: async (slug) => skills.find((s) => s.slug === slug) ?? null,
  findByAlias: async (aliasSlug) => {
    const slug = aliases[aliasSlug];
    return slug ? skills.find((s) => s.slug === slug) ?? null : null;
  },
  createCustom: async () => {
    throw new Error("not implemented");
  },
  listAliases: async () => [],
});

describe("SkillNormalizer", () => {
  const catalog = createCatalog(
    [
      { id: "1", slug: "react", name: "React", status: "OFFICIAL" },
      { id: "2", slug: "typescript", name: "TypeScript", status: "OFFICIAL" },
      { id: "3", slug: "nodejs", name: "Node.js", status: "OFFICIAL" },
    ],
    { nodejs: "nodejs" },
  );

  const normalizer = new SkillNormalizer(catalog);

  it("resolves official slug from skill name", async () => {
    await expect(normalizer.resolveSlug("React")).resolves.toBe("react");
  });

  it("resolves alias to canonical slug", async () => {
    await expect(normalizer.resolveSlug("Node.js")).resolves.toBe("nodejs");
  });

  it("compares user skills vs job technologies", async () => {
    const result = await normalizer.compare(["React", "TypeScript"], ["React", "Docker"]);
    expect(result.matched).toEqual(["react"]);
    expect(result.missing).toEqual(["docker"]);
    expect(result.userSkillSlugs).toEqual(expect.arrayContaining(["react", "typescript"]));
  });
});
