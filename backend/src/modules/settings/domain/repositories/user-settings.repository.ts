import type { UpdateUserSettingsInput, UserSettingsEntity } from "../entities/user-settings.entity.js";

export interface UserSettingsRepository {
  findByUserId(userId: string): Promise<UserSettingsEntity | null>;
  createDefault(userId: string): Promise<UserSettingsEntity>;
  update(userId: string, input: UpdateUserSettingsInput): Promise<UserSettingsEntity | null>;
}
