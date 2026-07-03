import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

import { logger } from "../config/logger.js";
import { AppError } from "../shared/errors/app-error.js";

type PrismaKnownError = {
  code?: string;
};

const prismaErrorMap: Record<string, { statusCode: number; message: string }> = {
  P2002: { statusCode: 409, message: "Unique constraint failed" },
  P2025: { statusCode: 404, message: "Record not found" },
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
      code: prismaError.code,
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
