export type RefreshFrequency = "15m" | "30m" | "1h" | "2h" | "manual";

export type UserSettings = {
  id: string;
  userId: string;
  theme: "dark" | "light" | "system";
  jobRefreshFrequency: RefreshFrequency;
  dashboardNotificationInterval: RefreshFrequency;
  updatedAt: string;
};

export type UpdateSettingsPayload = Partial<
  Pick<UserSettings, "theme" | "jobRefreshFrequency" | "dashboardNotificationInterval">
>;
