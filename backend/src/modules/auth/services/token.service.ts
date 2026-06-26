import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../../../config/env.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import type { AuthSessionPayload } from "../types/auth.types.js";

const getSecret = (): string => env.JWT_SECRET ?? "dev-jwt-secret-change-me";

export class TokenService {
  signAccessToken(payload: Omit<AuthSessionPayload, "type">): string {
    const options: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
    };

    return jwt.sign({ ...payload, type: "access" }, getSecret(), options);
  }

  signRefreshToken(payload: Omit<AuthSessionPayload, "type">): string {
    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
    };

    return jwt.sign({ ...payload, type: "refresh" }, getSecret(), options);
  }

  verifyToken(token: string, expectedType: AuthSessionPayload["type"]): AuthSessionPayload {
    try {
      const decoded = jwt.verify(token, getSecret()) as AuthSessionPayload;

      if (decoded.type !== expectedType) {
        throw new UnauthorizedError("Invalid token type");
      }

      return decoded;
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
}

export const tokenService = new TokenService();
