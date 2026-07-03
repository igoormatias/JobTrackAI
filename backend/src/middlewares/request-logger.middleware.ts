import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

import { logger } from "../config/logger.js";

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId =
    (typeof req.headers["x-correlation-id"] === "string" && req.headers["x-correlation-id"]) ||
    randomUUID();

  req.headers["x-correlation-id"] = correlationId;
  res.setHeader("x-correlation-id", correlationId);

  const startedAt = Date.now();

  res.on("finish", () => {
    logger.info(
      {
        correlationId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      },
      "HTTP request completed",
    );
  });

  next();
};
