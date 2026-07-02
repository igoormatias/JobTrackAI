import type { Request } from "express";

import { ValidationError } from "../errors/validation-error.js";

export const getRouteParam = (req: Request, name: string): string => {
  const value = req.params[name];

  if (typeof value !== "string" || value.length === 0) {
    throw new ValidationError(`Invalid route parameter: ${name}`);
  }

  return value;
};
