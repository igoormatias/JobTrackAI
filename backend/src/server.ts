import "dotenv/config";

import { createServer } from "node:http";

import { createApp } from "./app.js";
import { connectRedis, createSocketServer, env, logger } from "./config/index.js";
import { RunAllProvidersUseCase } from "./modules/job-aggregation/application/use-cases/run-providers.use-cases.js";
import { syncProviderRegistryFromEnv } from "./modules/job-aggregation/infrastructure/bootstrap/sync-provider-registry.js";
import { createJobAggregationService } from "./modules/job-aggregation/infrastructure/http/routes/provider.routes.js";
import { ProviderSyncScheduler } from "./modules/job-aggregation/infrastructure/scheduler/provider-sync.scheduler.js";
import { SchedulerService } from "./modules/scheduler/services/scheduler.service.js";
import { eventBus } from "./shared/events/event-bus.js";
import { setupRealtimeBridge } from "./shared/events/realtime-bridge.js";

export { createApp } from "./app.js";

export const startServer = async (): Promise<void> => {
  const app = createApp();
  const httpServer = createServer(app);

  await syncProviderRegistryFromEnv();

  if (env.ENABLE_REALTIME) {
    const io = createSocketServer(httpServer);
    setupRealtimeBridge(eventBus, io);
    const scheduler = new SchedulerService();
    scheduler.start();
  }

  if (env.ENABLE_SCHEDULER) {
    const aggregationService = createJobAggregationService();
    const runAllProviders = new RunAllProvidersUseCase(aggregationService);
    const providerScheduler = new ProviderSyncScheduler(runAllProviders, env.SYNC_INTERVAL);
    providerScheduler.start();
  }

  await connectRedis();

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
};

if (process.env.VITEST !== "true") {
  startServer().catch((error) => {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  });
}
