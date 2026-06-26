import type { NextFunction, Request, Response } from "express";

import { NotFoundError } from "../shared/errors/not-found-error.js";

export const notFoundMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError("Route not found"));
};
