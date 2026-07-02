import "dotenv/config";

import { createServer } from "node:http";

import { createApp } from "./app.js";
import { connectRedis, createSocketServer, env, logger } from "./config/index.js";
import { SchedulerService } from "./modules/scheduler/services/scheduler.service.js";

export { createApp } from "./app.js";

export const startServer = async (): Promise<void> => {
  const app = createApp();
  const httpServer = createServer(app);

  if (env.ENABLE_V2_FEATURES) {
    createSocketServer(httpServer);
    const scheduler = new SchedulerService();
    scheduler.start();
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
