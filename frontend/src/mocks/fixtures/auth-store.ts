import type { AuthProfile, AuthResponse, AuthUser, OnboardingCompletePayload } from "@/features/auth/types";

const ACCESS_COOKIE = "jt_access";
const REFRESH_COOKIE = "jt_refresh";

const cookieFlags = "Path=/; HttpOnly; SameSite=Lax";

const createAuthUser = (): AuthUser => ({
  id: "user_0001",
  name: "Matias Silva",
  email: "matias.silva@email.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Matias",
  provider: "google",
  createdAt: new Date().toISOString(),
  onboardingCompleted: false,
});

type AuthStoreState = {
  isAuthenticated: boolean;
  user: AuthUser;
  profile: AuthProfile | null;
};

let authStore: AuthStoreState = {
  isAuthenticated: false,
  user: createAuthUser(),
  profile: null,
};

const buildAuthResponse = (): AuthResponse => ({
  user: authStore.user,
  profile: authStore.profile,
  permissions: {
    canAccessApp: authStore.user.onboardingCompleted,
    canManageSettings: true,
  },
});

export const getAuthStore = (): AuthStoreState => authStore;

export const loginAuthStore = (): AuthResponse => {
  authStore = {
    ...authStore,
    isAuthenticated: true,
    user: createAuthUser(),
  };

  return buildAuthResponse();
};

export const logoutAuthStore = (): void => {
  authStore = {
    isAuthenticated: false,
    user: createAuthUser(),
    profile: null,
  };
};

export const completeOnboardingAuthStore = (payload: OnboardingCompletePayload): AuthResponse => {
  authStore = {
    isAuthenticated: true,
    user: {
      ...authStore.user,
      onboardingCompleted: true,
    },
    profile: {
      professionalArea: payload.professionalArea,
      seniority: payload.seniority,
      salaryExpectation: payload.salaryExpectation,
      location: payload.location,
      skills: payload.skills,
      blockedSkills: payload.blockedSkills,
    },
  };

  return buildAuthResponse();
};

export const getAuthCookies = (): string[] => [
  `${ACCESS_COOKIE}=mock_access_token; ${cookieFlags}`,
  `${REFRESH_COOKIE}=mock_refresh_token; ${cookieFlags}`,
];

export const getClearAuthCookies = (): string[] => [
  `${ACCESS_COOKIE}=; ${cookieFlags}; Max-Age=0`,
  `${REFRESH_COOKIE}=; ${cookieFlags}; Max-Age=0`,
];

export const isAuthenticatedFromRequest = (cookieHeader: string | null): boolean => {
  if (!authStore.isAuthenticated) {
    return false;
  }

  return Boolean(cookieHeader?.includes(`${ACCESS_COOKIE}=`) && !cookieHeader.includes(`${ACCESS_COOKIE}=;`));
};

export const resetAuthStore = (): void => {
  authStore = {
    isAuthenticated: false,
    user: createAuthUser(),
    profile: null,
  };
};

export { ACCESS_COOKIE, REFRESH_COOKIE };
