import { describe, expect, it, vi } from "vitest";

import type { SkillCatalogRepository, UserSkillRepository } from "../../domain/repositories/skill-catalog.repository.js";
import { SkillNormalizer } from "../../domain/services/skill-normalizer.service.js";
import { SyncUserSkillsUseCase } from "./sync-user-skills.use-case.js";

describe("SyncUserSkillsUseCase", () => {
  it("syncs skillNames to UserSkill records", async () => {
    const catalog: SkillCatalogRepository = {
      findBySlug: vi.fn().mockResolvedValue({ id: "skill-1", slug: "react", name: "React", status: "OFFICIAL" }),
      findByAlias: vi.fn().mockResolvedValue(null),
      createCustom: vi.fn(),
      listAliases: vi.fn().mockResolvedValue([]),
    };

    const userSkills: UserSkillRepository = {
      listByUserId: vi.fn(),
      upsertMany: vi.fn().mockResolvedValue(undefined),
      deleteNotInSkillIds: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new SyncUserSkillsUseCase(catalog, userSkills, new SkillNormalizer(catalog));
    await useCase.execute("user-1", ["React", "React"]);

    expect(userSkills.upsertMany).toHaveBeenCalledWith("user-1", [
      { skillId: "skill-1", level: "INTERMEDIATE", status: "OFFICIAL" },
    ]);
    expect(userSkills.deleteNotInSkillIds).toHaveBeenCalledWith("user-1", ["skill-1"]);
  });
});
