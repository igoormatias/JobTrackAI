import { describe, expect, it, beforeEach } from "vitest";

import { inMemoryAuthUserRepository } from "../repositories/user.repository.js";
import type { GoogleUser } from "../types/auth.types.js";
import { AuthService } from "./auth.service.js";
import type { GoogleAuthService } from "./google-auth.service.js";
import { TokenService } from "./token.service.js";

const testGoogleUser: GoogleUser = {
  sub: "google_test_0001",
  email: "matias.silva@email.com",
  name: "Matias Silva",
  picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Matias",
};

const createStubGoogleAuthService = (): GoogleAuthService => ({
  verifyIdToken: async () => testGoogleUser,
});

const createMockResponse = () => {
  const cookies: Record<string, string> = {};

  return {
    cookie: (name: string, value: string) => {
      cookies[name] = value;
    },
    clearCookie: (name: string) => {
      delete cookies[name];
    },
    cookies,
  } as unknown as import("express").Response & { cookies: Record<string, string> };
};

describe("AuthService", () => {
  beforeEach(() => {
    inMemoryAuthUserRepository.reset();
  });

  it("logs in with Google idToken and sets session data", async () => {
    const service = new AuthService(
      createStubGoogleAuthService(),
      new TokenService(),
      inMemoryAuthUserRepository,
    );
    const res = createMockResponse();

    const response = await service.loginWithGoogle("test-id-token", res);

    expect(response.data.user.email).toBe("matias.silva@email.com");
    expect(response.data.user.onboardingCompleted).toBe(false);
    expect(res.cookies.jt_access).toBeTruthy();
    expect(res.cookies.jt_refresh).toBeTruthy();
  });

  it("completes onboarding and updates user profile", async () => {
    const service = new AuthService(
      createStubGoogleAuthService(),
      new TokenService(),
      inMemoryAuthUserRepository,
    );
    const res = createMockResponse();
    const login = await service.loginWithGoogle("test-id-token", res);

    const completed = await service.completeOnboarding(login.data.user.id, {
      professionalArea: "frontend",
      seniority: "senior",
      modality: "remote",
      salaryBand: "8k_12k",
      salaryExpectation: { min: 8000, max: 12000, currency: "BRL" },
      location: "São Paulo, SP",
      locationPreference: {
        scope: "city",
        city: "São Paulo",
        state: "SP",
        acceptsRelocation: false,
      },
      skills: ["React", "TypeScript"],
    });

    expect(completed.data.user.onboardingCompleted).toBe(true);
  });
});
