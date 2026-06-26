import type { NextFunction, Request, Response } from "express";

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
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: "error",
      code: error.code,
      message: error.message,
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
    });
    return;
  }

  logger.error({ error }, "Unhandled error");

  res.status(500).json({
    status: "error",
    code: "INTERNAL_ERROR",
    message: "Internal server error",
  });
};
