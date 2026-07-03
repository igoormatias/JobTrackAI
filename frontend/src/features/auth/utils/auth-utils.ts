export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";
export const AUTH_SESSION_INVALID_EVENT = "auth:session-invalid";

export const emitSessionExpired = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
  }
};

export const emitSessionInvalid = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_INVALID_EVENT));
  }
};

export const getPostLoginRedirect = (onboardingCompleted: boolean): string =>
  onboardingCompleted ? "/dashboard" : "/onboarding";
