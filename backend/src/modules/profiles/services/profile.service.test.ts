import { describe, expect, it, beforeEach } from "vitest";

import { profileRepository } from "../repositories/profile.repository.js";
import { ProfileService } from "./profile.service.js";

describe("ProfileService", () => {
  beforeEach(() => {
    profileRepository.reset();
  });

  it("creates a profile draft", () => {
    const service = new ProfileService();
    const profile = service.createProfile("user_0001", {
      area: "frontend",
      skillNames: ["React"],
    });

    expect(profile.userId).toBe("user_0001");
    expect(profile.area).toBe("frontend");
    expect(profile.onboardingCompleted).toBe(false);
  });

  it("throws conflict when profile already exists", () => {
    const service = new ProfileService();
    service.createProfile("user_0001", { area: "frontend" });

    expect(() => service.createProfile("user_0001", { area: "backend" })).toThrow("Profile already exists");
  });

  it("updates profile and marks complete", () => {
    const service = new ProfileService();
    service.createProfile("user_0001", { area: "frontend" });

    const updated = service.updateProfile("user_0001", {
      seniority: "senior",
      onboardingProgress: {
        currentStep: "summary",
        lastSavedAt: new Date().toISOString(),
      },
    });

    expect(updated.seniority).toBe("senior");

    const completed = service.markComplete("user_0001");
    expect(completed.onboardingCompleted).toBe(true);
  });

  it("throws not found for missing profile", () => {
    const service = new ProfileService();
    expect(() => service.getProfile("missing")).toThrow("Profile not found");
  });
});
