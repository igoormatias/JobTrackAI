import { describe, expect, it } from "vitest";

import { accountProfileSchema } from "./account-profile.schema";
import { accountSettingsSchema } from "./account-settings.schema";

describe("accountProfileSchema", () => {
  it("validates MVP profile fields", () => {
    const result = accountProfileSchema.safeParse({
      area: "frontend",
      seniority: "senior",
      modality: "remote",
      locationPreference: {
        scope: "country",
        acceptsRelocation: false,
      },
      salaryBand: "8k_12k",
      skillNames: ["React"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty skills", () => {
    const result = accountProfileSchema.safeParse({
      area: "frontend",
      seniority: "senior",
      modality: "remote",
      locationPreference: {
        scope: "country",
        acceptsRelocation: false,
      },
      salaryBand: "8k_12k",
      skillNames: [],
    });

    expect(result.success).toBe(false);
  });
});

describe("accountSettingsSchema", () => {
  it("validates MVP settings fields", () => {
    const result = accountSettingsSchema.safeParse({
      theme: "system",
      jobRefreshFrequency: "1h",
      dashboardNotificationInterval: "30m",
      showCompatibleJobsOnly: true,
      showSalaryWhenAvailable: false,
    });

    expect(result.success).toBe(true);
  });
});
