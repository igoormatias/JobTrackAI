import { Router } from "express";

import { aiCareerRateLimiter } from "../../../../../middlewares/rate-limit.js";
import { requireAuth } from "../../../../../middlewares/auth-middleware.js";
import { CareerAnalysisService } from "../../../application/services/career-analysis.service.js";
import {
  GenerateCareerAnalysisUseCase,
  GetCareerAnalysisUseCase,
} from "../../../application/use-cases/career-analysis.use-cases.js";
import { SkillNormalizer } from "../../../domain/services/skill-normalizer.service.js";
import { geminiProvider } from "../../providers/gemini.provider.js";
import { prismaAIAnalysisRepository } from "../../repositories/prisma-ai-analysis.repository.js";
import { prismaCareerAnalysisContextRepository } from "../../repositories/prisma-career-analysis-context.repository.js";
import {
  prismaSkillCatalogRepository,
  prismaUserSkillRepository,
} from "../../repositories/prisma-skill-catalog.repository.js";
import { AiCareerAnalysisController } from "../controllers/ai-career-analysis.controller.js";
import { AiSkillsController } from "../controllers/ai-skills.controller.js";
import {
  NormalizeSkillsUseCase,
  SearchSkillsCatalogUseCase,
} from "../../../application/use-cases/skills.use-cases.js";

const buildCareerAnalysisService = (): CareerAnalysisService =>
  new CareerAnalysisService(
    prismaCareerAnalysisContextRepository,
    prismaAIAnalysisRepository,
    prismaUserSkillRepository,
    geminiProvider,
    new SkillNormalizer(prismaSkillCatalogRepository),
  );

export const createAiRoutes = (): Router => {
  const router = Router();
  router.use(requireAuth);

  const service = buildCareerAnalysisService();
  const controller = new AiCareerAnalysisController(
    new GetCareerAnalysisUseCase(service),
    new GenerateCareerAnalysisUseCase(service),
  );

  router.get("/career-analysis/:trackingId", controller.get);
  router.post("/career-analysis/:trackingId", aiCareerRateLimiter, controller.generate);

  const skillNormalizer = new SkillNormalizer(prismaSkillCatalogRepository);
  const skillsController = new AiSkillsController(
    new SearchSkillsCatalogUseCase(prismaSkillCatalogRepository),
    new NormalizeSkillsUseCase(prismaSkillCatalogRepository, skillNormalizer),
  );
  router.get("/skills/catalog", skillsController.catalog);
  router.post("/skills/normalize", aiCareerRateLimiter, skillsController.normalize);

  return router;
};

export { buildCareerAnalysisService };
