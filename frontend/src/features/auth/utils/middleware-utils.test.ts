import { describe, expect, it } from "vitest";

import { resolveMiddlewareRedirect } from "./middleware-utils";

describe("resolveMiddlewareRedirect", () => {
  it("redirects root to login when unauthenticated", () => {
    expect(resolveMiddlewareRedirect("/", false)).toBe("/login");
  });

  it("redirects root to dashboard when authenticated", () => {
    expect(resolveMiddlewareRedirect("/", true)).toBe("/dashboard");
  });

  it("protects dashboard routes", () => {
    expect(resolveMiddlewareRedirect("/dashboard", false)).toBe("/login");
  });

  it("redirects authenticated users away from login", () => {
    expect(resolveMiddlewareRedirect("/login", true)).toBe("/dashboard");
  });
});
