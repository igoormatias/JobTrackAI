import type { UseCase } from "../../../../shared/application/use-case.js";
import type { EventBus } from "../../../../shared/events/event-bus.interface.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { SettingsUpdatedEvent } from "../../domain/events/settings-updated.event.js";
import type { UpdateUserSettingsInput } from "../../domain/entities/user-settings.entity.js";
import type { UserSettingsRepository } from "../../domain/repositories/user-settings.repository.js";
import type { SettingsResponseDto } from "../dto/settings-response.dto.js";

type UpdateSettingsInput = {
  userId: string;
  data: UpdateUserSettingsInput;
};

export class UpdateSettingsUseCase implements UseCase<UpdateSettingsInput, SettingsResponseDto> {
  constructor(
    private readonly settingsRepository: UserSettingsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ userId, data }: UpdateSettingsInput): Promise<SettingsResponseDto> {
    const updated = await this.settingsRepository.update(userId, data);

    if (!updated) {
      throw new NotFoundError("Settings not found");
    }

    await this.eventBus.publish(
      new SettingsUpdatedEvent({
        userId,
        settings: updated,
      }),
    );

    return {
      data: updated,
      message: "Settings updated successfully",
    };
  }
}
