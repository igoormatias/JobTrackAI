import { Router } from "express";

import { providerRunRateLimiter } from "../../../../../middlewares/rate-limit.js";
import { requireAuth } from "../../../../../middlewares/auth-middleware.js";
import { eventBus } from "../../../../../shared/events/event-bus.js";
import { JobSyncNotificationService } from "../../../../notifications/application/job-sync-notification.service.js";
import { NotificationService } from "../../../../notifications/application/notification.service.js";
import { prismaNotificationRepository } from "../../../../notifications/infrastructure/repositories/prisma-notification.repository.js";
import { prismaJobCatalogRepository } from "../../../../job-catalog/infrastructure/repositories/prisma-job-catalog.repository.js";
import { GetProviderHistoryUseCase, GetProviderStatisticsUseCase } from "../../../application/use-cases/get-provider-stats.use-cases.js";
import { GetProvidersHealthUseCase, GetProvidersUseCase } from "../../../application/use-cases/get-providers.use-cases.js";
import { RunAllProvidersUseCase, RunProviderUseCase } from "../../../application/use-cases/run-providers.use-cases.js";
import { JobAggregationService } from "../../../application/services/job-aggregation.service.js";
import { prismaDedupLookupRepository } from "../../repositories/prisma-dedup-lookup.repository.js";
import { prismaJobImportRepository } from "../../repositories/prisma-job-import.repository.js";
import { prismaProviderExecutionRepository } from "../../repositories/prisma-provider-execution.repository.js";
import { prismaProviderRegistryRepository } from "../../repositories/prisma-provider-registry.repository.js";
import { createProviderMap } from "../../providers/provider-registry.js";
import { ProviderController } from "../controllers/provider.controller.js";

const buildAggregationService = (): JobAggregationService => {
  const notificationService = new NotificationService(prismaNotificationRepository, eventBus);
  const jobSyncNotifications = new JobSyncNotificationService(notificationService, eventBus);

  return new JobAggregationService(
    createProviderMap(),
    prismaProviderExecutionRepository,
    prismaJobImportRepository,
    prismaProviderRegistryRepository,
    prismaJobCatalogRepository,
    prismaDedupLookupRepository,
    jobSyncNotifications,
  );
};

export const createProviderRoutes = (): Router => {
  const router = Router();
  router.use(requireAuth);

  const providers = createProviderMap();
  const aggregationService = buildAggregationService();

  const controller = new ProviderController(
    new GetProvidersUseCase(prismaProviderRegistryRepository),
    new GetProviderStatisticsUseCase(
      prismaProviderExecutionRepository,
      prismaProviderRegistryRepository,
      prismaDedupLookupRepository,
    ),
    new GetProviderHistoryUseCase(prismaProviderExecutionRepository),
    new GetProvidersHealthUseCase(providers, prismaProviderRegistryRepository),
    new RunAllProvidersUseCase(aggregationService),
    new RunProviderUseCase(aggregationService),
  );

  router.get("/", controller.list);
  router.get("/statistics", controller.statistics);
  router.get("/history", controller.history);
  router.get("/health", controller.health);
  router.post("/run", providerRunRateLimiter, controller.runAll);
  router.post("/run/:provider", providerRunRateLimiter, controller.runOne);

  return router;
};

export const createJobAggregationService = buildAggregationService;
