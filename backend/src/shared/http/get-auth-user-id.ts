import type { Request } from "express";

import { UnauthorizedError } from "../errors/unauthorized-error.js";

export const getAuthUserId = (req: Request): string => {
  const userId = req.auth?.userId;
  if (!userId) throw new UnauthorizedError("Unauthorized");
  return userId;
};
