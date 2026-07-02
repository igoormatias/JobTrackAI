import type { UserSettings } from "@prisma/client";

import type {
  RefreshFrequency,
  ThemePreference,
  UserSettingsEntity,
} from "../../domain/entities/user-settings.entity.js";

const toRefreshFrequency = (value: string): RefreshFrequency => {
  const allowed: RefreshFrequency[] = ["15m", "30m", "1h", "2h", "manual"];
  return allowed.includes(value as RefreshFrequency) ? (value as RefreshFrequency) : "1h";
};

const toThemePreference = (value: string): ThemePreference => {
  const allowed: ThemePreference[] = ["dark", "light", "system"];
  return allowed.includes(value as ThemePreference) ? (value as ThemePreference) : "dark";
};

export class UserSettingsMapper {
  static toEntity(record: UserSettings): UserSettingsEntity {
    return {
      id: record.id,
      userId: record.userId,
      theme: toThemePreference(record.theme),
      jobRefreshFrequency: toRefreshFrequency(record.jobRefreshFrequency),
      dashboardNotificationInterval: toRefreshFrequency(record.dashboardNotificationInterval),
      showCompatibleJobsOnly: record.showCompatibleJobsOnly,
      showSalaryWhenAvailable: record.showSalaryWhenAvailable,
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
