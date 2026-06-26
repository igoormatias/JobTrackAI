import type { GoogleUser } from "../types/auth.types.js";

export type GoogleAuthService = {
  verifyIdToken: (idToken?: string) => Promise<GoogleUser>;
};

export class MockGoogleAuthService implements GoogleAuthService {
  verifyIdToken = async (_idToken?: string): Promise<GoogleUser> => ({
    sub: "google_mock_0001",
    email: "matias.silva@email.com",
    name: "Matias Silva",
    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Matias",
  });
}

export class RealGoogleAuthService implements GoogleAuthService {
  verifyIdToken = async (_idToken?: string): Promise<GoogleUser> => {
    throw new Error("Google OAuth is not configured yet");
  };
}

export const createGoogleAuthService = (): GoogleAuthService => {
  if (process.env.GOOGLE_CLIENT_ID) {
    return new RealGoogleAuthService();
  }

  return new MockGoogleAuthService();
};
