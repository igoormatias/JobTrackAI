import { describe, expect, it, beforeEach } from "vitest";

import { inMemoryAuthUserRepository } from "../repositories/user.repository.js";
import { AuthService } from "./auth.service.js";
import { MockGoogleAuthService } from "./google-auth.service.js";
import { TokenService } from "./token.service.js";

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

  it("logs in with mock google user and sets session data", async () => {
    const service = new AuthService(
      new MockGoogleAuthService(),
      new TokenService(),
      inMemoryAuthUserRepository,
    );
    const res = createMockResponse();

    const response = await service.loginWithGoogle(undefined, res);

    expect(response.data.user.email).toBe("matias.silva@email.com");
    expect(response.data.user.onboardingCompleted).toBe(false);
    expect(res.cookies.jt_access).toBeTruthy();
    expect(res.cookies.jt_refresh).toBeTruthy();
  });

  it("completes onboarding and updates user profile", async () => {
    const service = new AuthService(
      new MockGoogleAuthService(),
      new TokenService(),
      inMemoryAuthUserRepository,
    );
    const res = createMockResponse();
    const login = await service.loginWithGoogle(undefined, res);

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
      blockedSkills: ["PHP"],
    });

    expect(completed.data.user.onboardingCompleted).toBe(true);
  });
});
