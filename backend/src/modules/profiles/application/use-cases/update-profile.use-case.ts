import type { UseCase } from "../../../../shared/application/use-case.js";
import type { EventBus } from "../../../../shared/events/event-bus.interface.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ProfileUpdatedEvent } from "../../domain/events/profile-updated.event.js";
import type { UpdateProfileInput } from "../../domain/entities/profile.entity.js";
import type { ProfileRepository } from "../../domain/repositories/profile.repository.js";
import type { ProfileResponseDto } from "../dto/profile-response.dto.js";

type UpdateProfileCommand = {
  userId: string;
  input: UpdateProfileInput;
};

export class UpdateProfileUseCase implements UseCase<UpdateProfileCommand, ProfileResponseDto> {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ userId, input }: UpdateProfileCommand): Promise<ProfileResponseDto> {
    const updated = await this.profileRepository.update(userId, input);

    if (!updated) {
      throw new NotFoundError("Profile not found");
    }

    const withUser = await this.profileRepository.findWithUserByUserId(userId);

    if (!withUser) {
      throw new NotFoundError("Profile not found");
    }

    await this.eventBus.publish(
      new ProfileUpdatedEvent({
        userId,
        profile: updated,
      }),
    );

    return {
      data: withUser,
      message: "Profile updated successfully",
    };
  }
}
