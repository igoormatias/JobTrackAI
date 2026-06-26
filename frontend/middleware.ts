import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_COOKIE_NAME,
  resolveMiddlewareRedirect,
} from "@/features/auth/utils/middleware-utils";

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const hasAccessCookie = Boolean(request.cookies.get(ACCESS_COOKIE_NAME)?.value);
  const redirectPath = resolveMiddlewareRedirect(pathname, hasAccessCookie);

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/",
    "/login",
    "/unauthorized",
    "/session-expired",
    "/dashboard/:path*",
    "/jobs/:path*",
    "/pipeline/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
