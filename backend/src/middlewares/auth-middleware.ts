import type { NextFunction, Request, Response } from "express";

import { UnauthorizedError } from "../shared/errors/unauthorized-error.js";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "../modules/auth/services/auth.service.js";
import { tokenService } from "../modules/auth/services/token.service.js";
import type { AuthSessionPayload } from "../modules/auth/types/auth.types.js";

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthSessionPayload;
  }
}

export { ACCESS_COOKIE, REFRESH_COOKIE };

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const accessToken = req.cookies?.[ACCESS_COOKIE] as string | undefined;

    if (!accessToken) {
      throw new UnauthorizedError("Access token missing");
    }

    req.auth = tokenService.verifyToken(accessToken, "access");
    next();
  } catch (error) {
    next(error);
  }
};
