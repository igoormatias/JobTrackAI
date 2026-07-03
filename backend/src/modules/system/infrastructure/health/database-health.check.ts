import { prisma } from "../../../../database/prisma.js";
import type { HealthCheckItemDto } from "../../application/dto/health-response.dto.js";

export const checkDatabaseHealth = async (): Promise<HealthCheckItemDto> => {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: "ok",
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      status: "error",
      latencyMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "Database unreachable",
    };
  }
};
