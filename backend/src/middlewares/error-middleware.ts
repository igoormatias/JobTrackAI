import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

import { logger } from "../config/logger.js";
import { AppError } from "../shared/errors/app-error.js";

type PrismaKnownError = {
  code?: string;
};

const prismaErrorMap: Record<string, { statusCode: number; code: string; message: string }> = {
  P2002: { statusCode: 409, code: "P2002", message: "Unique constraint failed" },
  P2025: { statusCode: 404, code: "P2025", message: "Record not found" },
  P2021: {
    statusCode: 503,
    code: "DATABASE_SCHEMA_OUTDATED",
    message: "Database schema is outdated. Run prisma migrate deploy.",
  },
};

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const correlationId = req.headers["x-correlation-id"];

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: "error",
      code: error.code,
      message: error.message,
      correlationId,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error({ error, correlationId }, "Database initialization failed");
    res.status(503).json({
      status: "error",
      code: "DATABASE_UNAVAILABLE",
      message: "Database is unavailable",
      correlationId,
    });
    return;
  }

  const prismaError = error as PrismaKnownError;

  if (prismaError.code && prismaErrorMap[prismaError.code]) {
    const mapped = prismaErrorMap[prismaError.code];
    res.status(mapped.statusCode).json({
      status: "error",
      code: mapped.code,
      message: mapped.message,
      correlationId,
    });
    return;
  }

  logger.error({ error, correlationId }, "Unhandled error");

  res.status(500).json({
    status: "error",
    code: "INTERNAL_ERROR",
    message: "Internal server error",
    correlationId,
  });
};
