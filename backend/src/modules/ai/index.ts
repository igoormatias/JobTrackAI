export { createAiRoutes, buildCareerAnalysisService } from "./infrastructure/http/routes/ai.routes.js";
export { SyncUserSkillsUseCase } from "./application/use-cases/sync-user-skills.use-case.js";
export { SkillNormalizer } from "./domain/services/skill-normalizer.service.js";
export {
  prismaSkillCatalogRepository,
  prismaUserSkillRepository,
} from "./infrastructure/repositories/prisma-skill-catalog.repository.js";
