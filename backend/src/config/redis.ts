import { Redis } from "ioredis";

import { env } from "./env.js";
import { logger } from "./logger.js";

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    redisClient.on("error", (error: Error) => {
      logger.warn({ error }, "Redis connection error");
    });
  }

  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  const client = getRedisClient();

  if (!client) {
    logger.info("Redis URL not configured — skipping connection");
    return;
  }

  if (client.status === "ready" || client.status === "connecting") {
    return;
  }

  await client.connect();
  logger.info("Redis connected");
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
