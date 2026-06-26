import { PROTECTED_ROUTES, PUBLIC_ROUTES, ACCESS_COOKIE_NAME } from "./route-config";

export { PROTECTED_ROUTES, PUBLIC_ROUTES, ACCESS_COOKIE_NAME };

export const isProtectedRoute = (pathname: string): boolean =>
  PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export const isPublicAuthRoute = (pathname: string): boolean =>
  PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export const resolveMiddlewareRedirect = (
  pathname: string,
  hasAccessCookie: boolean,
): string | null => {
  if (pathname === "/") {
    return hasAccessCookie ? "/dashboard" : "/login";
  }

  if (!hasAccessCookie && isProtectedRoute(pathname)) {
    return "/login";
  }

  if (hasAccessCookie && pathname === "/login") {
    return "/dashboard";
  }

  return null;
};
