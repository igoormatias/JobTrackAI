export const PUBLIC_ROUTES = ["/login", "/unauthorized", "/session-expired"] as const;

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/jobs",
  "/pipeline",
  "/profile",
  "/settings",
  "/onboarding",
] as const;

export const ACCESS_COOKIE_NAME = "jt_access";
