import { http, HttpResponse } from "msw";

import type { ApiResponse, ProfessionalArea, SalaryBand, Seniority } from "@/types";
import type { AuthResponse, OnboardingCompletePayload } from "@/features/auth/types";

import {
  completeOnboardingAuthStore,
  getAuthCookies,
  getAuthStore,
  getClearAuthCookies,
  isAuthenticatedFromRequest,
  loginAuthStore,
  logoutAuthStore,
  resetAuthStore,
} from "../fixtures/auth-store";
import { createUserProfile, getUserProfile, updateUserProfile } from "../fixtures/profile-store";

const jsonAuthResponse = (response: AuthResponse): ApiResponse<AuthResponse> => ({
  data: response,
});

const buildCookieHeaders = (cookies: string[]): Headers => {
  const headers = new Headers();
  cookies.forEach((cookie) => headers.append("Set-Cookie", cookie));
  return headers;
};

export const authHandlers = [
  http.post("*/auth/login", () => {
    const data = loginAuthStore();

    return HttpResponse.json(jsonAuthResponse(data), {
      headers: buildCookieHeaders(getAuthCookies()),
    });
  }),

  http.post("*/auth/logout", () => {
    logoutAuthStore();

    return HttpResponse.json(
      { data: null, message: "Logged out successfully" },
      {
        headers: buildCookieHeaders(getClearAuthCookies()),
      },
    );
  }),

  http.post("*/auth/refresh", ({ request }) => {
    const cookieHeader = request.headers.get("cookie");

    if (!isAuthenticatedFromRequest(cookieHeader) && !cookieHeader?.includes("jt_refresh=")) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const store = getAuthStore();
    if (!store.isAuthenticated) {
      loginAuthStore();
    }

    const data = jsonAuthResponse({
      user: getAuthStore().user,
      profile: getAuthStore().profile,
      permissions: {
        canAccessApp: getAuthStore().user.onboardingCompleted,
        canManageSettings: true,
      },
    }).data;

    return HttpResponse.json(jsonAuthResponse(data), {
      headers: buildCookieHeaders(getAuthCookies()),
    });
  }),

  http.get("*/auth/me", ({ request }) => {
    const cookieHeader = request.headers.get("cookie");
    const store = getAuthStore();

    if (!store.isAuthenticated && !isAuthenticatedFromRequest(cookieHeader)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json(
      jsonAuthResponse({
        user: store.user,
        profile: store.profile,
        permissions: {
          canAccessApp: store.user.onboardingCompleted,
          canManageSettings: true,
        },
      }),
    );
  }),

  http.post("*/auth/onboarding/complete", async ({ request }) => {
    const cookieHeader = request.headers.get("cookie");
    const store = getAuthStore();

    if (!store.isAuthenticated && !isAuthenticatedFromRequest(cookieHeader)) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as OnboardingCompletePayload;
    const data = completeOnboardingAuthStore(payload);

    const userId = getAuthStore().user.id;
    const profilePayload = {
      area: payload.professionalArea as ProfessionalArea,
      seniority: payload.seniority as Seniority,
      modality: payload.modality,
      location: payload.location,
      locationPreference: payload.locationPreference,
      salaryBand: payload.salaryBand as SalaryBand,
      salaryExpectation: payload.salaryExpectation,
      skillNames: payload.skills,
      blockedSkills: payload.blockedSkills,
      onboardingCompleted: true,
    };

    if (getUserProfile(userId)) {
      updateUserProfile(userId, profilePayload);
    } else {
      createUserProfile(userId, profilePayload);
    }

    return HttpResponse.json({
      data: { user: data.user },
      message: "Onboarding completed successfully",
    });
  }),
];

export { resetAuthStore };
