import { SyncUserSkillsUseCase } from "./use-cases/sync-user-skills.use-case.js";
import { SkillNormalizer } from "../domain/services/skill-normalizer.service.js";
import {
  prismaSkillCatalogRepository,
  prismaUserSkillRepository,
} from "../infrastructure/repositories/prisma-skill-catalog.repository.js";

const syncUserSkillsUseCase = new SyncUserSkillsUseCase(
  prismaSkillCatalogRepository,
  prismaUserSkillRepository,
  new SkillNormalizer(prismaSkillCatalogRepository),
);

export const syncUserSkillsFromNames = async (userId: string, skillNames: string[]): Promise<void> => {
  if (skillNames.length === 0) return;
  await syncUserSkillsUseCase.execute(userId, skillNames);
};
