import { OAuth2Client } from "google-auth-library";

import { env } from "../../../config/env.js";
import type { GoogleUser } from "../types/auth.types.js";

export type GoogleAuthService = {
  verifyIdToken: (idToken: string) => Promise<GoogleUser>;
};

export class GoogleAuthServiceImpl implements GoogleAuthService {
  private readonly client: OAuth2Client;

  constructor(clientId: string) {
    this.client = new OAuth2Client(clientId);
  }

  verifyIdToken = async (idToken: string): Promise<GoogleUser> => {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new Error("Invalid Google token payload");
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email,
      picture: payload.picture ?? null,
    };
  };
}

export const createGoogleAuthService = (): GoogleAuthService => {
  return new GoogleAuthServiceImpl(env.GOOGLE_CLIENT_ID);
};
