import type { Response } from "express";

import { env } from "../../../config/env.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import type { AuthUserRepository } from "../domain/repositories/auth-user.repository.js";
import { prismaAuthUserRepository } from "../infrastructure/repositories/prisma-auth-user.repository.js";
import type { AuthResponseDto, OnboardingCompleteResponseDto } from "../dto/auth-response.dto.js";
import { inMemoryAuthUserRepository } from "../repositories/user.repository.js";
import type { OnboardingCompleteInput } from "../schemas/auth.schemas.js";
import type { AuthPermissions, AuthProfile, AuthUser } from "../types/auth.types.js";
import { createGoogleAuthService, type GoogleAuthService } from "./google-auth.service.js";
import { tokenService, type TokenService } from "./token.service.js";
import { syncUserSkillsFromNames } from "../../ai/application/sync-user-skills.runner.js";

const ACCESS_COOKIE = "jt_access";
const REFRESH_COOKIE = "jt_refresh";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const defaultAuthUserRepository =
  process.env.NODE_ENV === "test" ? inMemoryAuthUserRepository : prismaAuthUserRepository;

export class AuthService {
  constructor(
    private readonly googleAuthService: GoogleAuthService = createGoogleAuthService(),
    private readonly tokens: TokenService = tokenService,
    private readonly users: AuthUserRepository = defaultAuthUserRepository,
  ) {}

  setAuthCookies(res: Response, userId: string, email: string): void {
    const accessToken = this.tokens.signAccessToken({ userId, email });
    const refreshToken = this.tokens.signRefreshToken({ userId, email });

    res.cookie(ACCESS_COOKIE, accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_COOKIE, { ...cookieOptions, maxAge: 0 });
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: 0 });
  }

  private buildPermissions(user: AuthUser): AuthPermissions {
    return {
      canAccessApp: user.onboardingCompleted,
      canManageSettings: true,
    };
  }

  private toAuthResponse(user: AuthUser, profile: AuthProfile | null): AuthResponseDto {
    return {
      data: {
        user,
        profile,
        permissions: this.buildPermissions(user),
      },
    };
  }

  async loginWithGoogle(idToken: string, res: Response): Promise<AuthResponseDto> {
    const googleUser = await this.googleAuthService.verifyIdToken(idToken);
    const stored = await this.users.upsertFromGoogle({
      name: googleUser.name,
      email: googleUser.email,
      avatar: googleUser.picture,
      provider: "google",
    });

    this.setAuthCookies(res, stored.id, stored.email);

    const { profile, ...user } = stored;
    return this.toAuthResponse(user, profile);
  }

  logout(res: Response): { message: string } {
    this.clearAuthCookies(res);
    return { message: "Logged out successfully" };
  }

  async refreshSession(refreshToken: string | undefined, res: Response): Promise<AuthResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token missing");
    }

    const payload = this.tokens.verifyToken(refreshToken, "refresh");
    const stored = await this.users.findById(payload.userId);

    if (!stored) {
      throw new UnauthorizedError("User not found");
    }

    this.setAuthCookies(res, stored.id, stored.email);

    const { profile, ...user } = stored;
    return this.toAuthResponse(user, profile);
  }

  async getCurrentUser(accessToken: string | undefined): Promise<AuthResponseDto> {
    if (!accessToken) {
      throw new UnauthorizedError("Access token missing");
    }

    const payload = this.tokens.verifyToken(accessToken, "access");
    const stored = await this.users.findById(payload.userId);

    if (!stored) {
      throw new UnauthorizedError("User not found");
    }

    const { profile, ...user } = stored;
    return this.toAuthResponse(user, profile);
  }

  async completeOnboarding(userId: string, input: OnboardingCompleteInput): Promise<OnboardingCompleteResponseDto> {
    const profile: AuthProfile = {
      professionalArea: input.professionalArea,
      seniority: input.seniority,
      salaryExpectation: input.salaryExpectation,
      location: input.location,
      skills: input.skills,
      modality: input.modality,
      locationPreference: input.locationPreference,
      salaryBand: input.salaryBand,
    };

    const updated = await this.users.updateProfile(userId, profile, true);

    if (!updated) {
      throw new UnauthorizedError("User not found");
    }

    await syncUserSkillsFromNames(userId, input.skills).catch(() => undefined);

    const { profile: _savedProfile, ...user } = updated;

    return {
      data: { user },
      message: "Onboarding completed successfully",
    };
  }
}

export const authService = new AuthService();

export { ACCESS_COOKIE, REFRESH_COOKIE };
