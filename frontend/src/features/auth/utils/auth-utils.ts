export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

export const emitSessionExpired = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
  }
};

export const getPostLoginRedirect = (onboardingCompleted: boolean): string =>
  onboardingCompleted ? "/dashboard" : "/onboarding";
