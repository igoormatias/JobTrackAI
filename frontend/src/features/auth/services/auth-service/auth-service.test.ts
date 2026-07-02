import { describe, expect, it } from "vitest";

import { loginWithGoogle, logout, getCurrentUser } from "./auth-service";

describe("auth-service", () => {
  it("logs in and returns current user", async () => {
    const loginResponse = await loginWithGoogle({ provider: "google", idToken: "test-id-token" });

    expect(loginResponse.user.email).toBe("matias.silva@email.com");
    expect(loginResponse.user.onboardingCompleted).toBe(false);

    const currentUser = await getCurrentUser();
    expect(currentUser.user.id).toBe(loginResponse.user.id);
  });

  it("logs out and clears session", async () => {
    await loginWithGoogle({ provider: "google", idToken: "test-id-token" });
    await logout();

    await expect(getCurrentUser()).rejects.toBeTruthy();
  });
});
