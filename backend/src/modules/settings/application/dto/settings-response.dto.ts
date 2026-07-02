import type { UserSettingsEntity } from "../../domain/entities/user-settings.entity.js";

export type SettingsResponseDto = {
  data: UserSettingsEntity;
  message?: string;
};
