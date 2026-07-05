import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { UnauthorizedError } from "../shared/errors/unauthorized-error.js";

export const verifyCronSecret = (req: Request, _res: Response, next: NextFunction): void => {
  const secret = env.CRON_SECRET;

  if (!secret) {
    next(new UnauthorizedError("Cron secret not configured"));
    return;
  }

  const authHeader = req.headers.authorization;
  const expected = `Bearer ${secret}`;

  if (authHeader !== expected) {
    next(new UnauthorizedError("Invalid cron secret"));
    return;
  }

  next();
};
