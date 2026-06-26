import { beforeEach, describe, expect, it } from "vitest";

import { loginWithGoogle } from "@/features/auth/services/auth-service";
import { resetAuthStore } from "@/mocks/handlers/auth.handlers";
import { resetProfileStore } from "@/mocks/handlers/profile.handlers";

import { fetchOnboardingProfile, saveOnboardingProfile } from "./onboarding-service";

describe("onboarding-service", () => {
  beforeEach(async () => {
    resetAuthStore();
    resetProfileStore();
    await loginWithGoogle({ provider: "google" });
  });

  it("returns null when profile does not exist", async () => {
    const profile = await fetchOnboardingProfile();
    expect(profile).toBeNull();
  });

  it("creates and updates onboarding profile draft", async () => {
    const created = await saveOnboardingProfile(
      {
        area: "frontend",
        skillNames: ["React"],
        onboardingProgress: {
          currentStep: "skills",
          lastSavedAt: new Date().toISOString(),
        },
      },
      false,
    );

    expect(created.area).toBe("frontend");

    const updated = await saveOnboardingProfile(
      {
        seniority: "senior",
      },
      true,
    );

    expect(updated.seniority).toBe("senior");
  });
});
