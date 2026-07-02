import type { UseCase } from "../../../../shared/application/use-case.js";
import type { UserSettingsRepository } from "../../domain/repositories/user-settings.repository.js";
import type { SettingsResponseDto } from "../dto/settings-response.dto.js";

export class GetSettingsUseCase implements UseCase<string, SettingsResponseDto> {
  constructor(private readonly settingsRepository: UserSettingsRepository) {}

  async execute(userId: string): Promise<SettingsResponseDto> {
    let settings = await this.settingsRepository.findByUserId(userId);

    if (!settings) {
      settings = await this.settingsRepository.createDefault(userId);
    }

    return { data: settings };
  }
}
