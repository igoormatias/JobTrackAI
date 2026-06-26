import type { UserSettings } from "@/types";

import { createId } from "../utils/mock-utils";

export type CreateSettingsInput = {
  userId: string;
  id?: string;
};

export const createSettings = ({ userId, id }: CreateSettingsInput): UserSettings => ({
  id: id ?? createId("settings", 1),
  userId,
  theme: "dark",
  refreshFrequency: "1h",
  emailNotifications: true,
  pushNotifications: true,
  pipelineNotifications: true,
  jobAlerts: true,
  language: "pt-BR",
  updatedAt: new Date().toISOString(),
});
