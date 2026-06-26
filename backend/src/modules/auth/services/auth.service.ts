import type { Response } from "express";

import { env } from "../../../config/env.js";
import { UnauthorizedError } from "../../../shared/errors/unauthorized-error.js";
import type { AuthResponseDto, OnboardingCompleteResponseDto } from "../dto/auth-response.dto.js";
import { userRepository } from "../repositories/user.repository.js";
import type { OnboardingCompleteInput } from "../schemas/auth.schemas.js";
import type { AuthPermissions, AuthProfile, AuthUser } from "../types/auth.types.js";
import { createGoogleAuthService, type GoogleAuthService } from "./google-auth.service.js";
import { tokenService, type TokenService } from "./token.service.js";

const ACCESS_COOKIE = "jt_access";
const REFRESH_COOKIE = "jt_refresh";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export class AuthService {
  constructor(
    private readonly googleAuthService: GoogleAuthService = createGoogleAuthService(),
    private readonly tokens: TokenService = tokenService,
    private readonly users = userRepository,
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
    res.clearCookie(ACCESS_COOKIE, cookieOptions);
    res.clearCookie(REFRESH_COOKIE, cookieOptions);
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

  async loginWithGoogle(idToken: string | undefined, res: Response): Promise<AuthResponseDto> {
    const googleUser = await this.googleAuthService.verifyIdToken(idToken);
    const stored = this.users.upsertFromGoogle({
      id: "user_0001",
      name: googleUser.name,
      email: googleUser.email,
      avatar: googleUser.picture,
      provider: "google",
      createdAt: new Date().toISOString(),
    });

    this.setAuthCookies(res, stored.id, stored.email);

    const { profile, ...user } = stored;
    return this.toAuthResponse(user, profile);
  }

  logout(res: Response): { message: string } {
    this.clearAuthCookies(res);
    return { message: "Logged out successfully" };
  }

  refreshSession(refreshToken: string | undefined, res: Response): AuthResponseDto {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token missing");
    }

    const payload = this.tokens.verifyToken(refreshToken, "refresh");
    const stored = this.users.findById(payload.userId);

    if (!stored) {
      throw new UnauthorizedError("User not found");
    }

    this.setAuthCookies(res, stored.id, stored.email);

    const { profile, ...user } = stored;
    return this.toAuthResponse(user, profile);
  }

  getCurrentUser(accessToken: string | undefined): AuthResponseDto {
    if (!accessToken) {
      throw new UnauthorizedError("Access token missing");
    }

    const payload = this.tokens.verifyToken(accessToken, "access");
    const stored = this.users.findById(payload.userId);

    if (!stored) {
      throw new UnauthorizedError("User not found");
    }

    const { profile, ...user } = stored;
    return this.toAuthResponse(user, profile);
  }

  completeOnboarding(userId: string, input: OnboardingCompleteInput): OnboardingCompleteResponseDto {
    const profile: AuthProfile = {
      professionalArea: input.professionalArea,
      seniority: input.seniority,
      salaryExpectation: input.salaryExpectation,
      location: input.location,
      skills: input.skills,
      blockedSkills: input.blockedSkills,
    };

    const updated = this.users.updateProfile(userId, profile, true);

    if (!updated) {
      throw new UnauthorizedError("User not found");
    }

    const { profile: savedProfile, ...user } = updated;

    return {
      data: { user },
      message: "Onboarding completed successfully",
    };
  }
}

export const authService = new AuthService();

export { ACCESS_COOKIE, REFRESH_COOKIE };
