import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

import { logger } from "../config/logger.js";
import { AppError } from "../shared/errors/app-error.js";

type PrismaKnownError = {
  code?: string;
  message?: string;
};

const prismaErrorMap: Record<string, { statusCode: number; code: string; message: string }> = {
  P2002: { statusCode: 409, code: "P2002", message: "Unique constraint failed" },
  P2025: { statusCode: 404, code: "P2025", message: "Record not found" },
  P2021: {
    statusCode: 503,
    code: "DATABASE_SCHEMA_OUTDATED",
    message: "Database schema is outdated. Run prisma migrate deploy.",
  },
  P2010: {
    statusCode: 400,
    code: "INVALID_QUERY",
    message: "A consulta não pôde ser processada. Tente outros termos de busca.",
  },
};

const isPostgresFunctionError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("does not exist") &&
    (message.includes("lower(jsonb)") ||
      message.includes("function lower") ||
      message.includes("operator does not exist"))
  );
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

  if (isPostgresFunctionError(error)) {
    logger.error({ error, correlationId }, "Invalid search query against JSONB/scalar");
    res.status(400).json({
      status: "error",
      code: "INVALID_SEARCH_QUERY",
      message: "Não foi possível processar a busca. Tente outros termos.",
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

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error({ error, correlationId, code: error.code }, "Prisma known request error");
    res.status(400).json({
      status: "error",
      code: error.code,
      message: "Não foi possível processar a solicitação.",
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
