export type RefreshFrequency =
  | "realtime"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "manual";

export type UserSettings = {
  id: string;
  userId: string;
  theme: "dark" | "light" | "system";
  refreshFrequency: RefreshFrequency;
  emailNotifications: boolean;
  pushNotifications: boolean;
  pipelineNotifications: boolean;
  jobAlerts: boolean;
  language: "pt-BR" | "en-US";
  updatedAt: string;
};

export type UpdateSettingsPayload = Partial<
  Pick<
    UserSettings,
    | "theme"
    | "refreshFrequency"
    | "emailNotifications"
    | "pushNotifications"
    | "pipelineNotifications"
    | "jobAlerts"
    | "language"
  >
>;
