export type ThemePreference = "dark" | "light" | "system";

export type RefreshFrequency = "15m" | "30m" | "1h" | "2h" | "manual";

export type UserSettingsEntity = {
  id: string;
  userId: string;
  theme: ThemePreference;
  jobRefreshFrequency: RefreshFrequency;
  dashboardNotificationInterval: RefreshFrequency;
  showCompatibleJobsOnly: boolean;
  showSalaryWhenAvailable: boolean;
  updatedAt: string;
};

export type UpdateUserSettingsInput = Partial<
  Pick<
    UserSettingsEntity,
    | "theme"
    | "jobRefreshFrequency"
    | "dashboardNotificationInterval"
    | "showCompatibleJobsOnly"
    | "showSalaryWhenAvailable"
  >
>;
