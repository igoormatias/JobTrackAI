import type { UseCase } from "../../../../shared/application/use-case.js";
import type { EventBus } from "../../../../shared/events/event-bus.interface.js";
import { ConflictError } from "../../../../shared/errors/conflict-error.js";
import { ProfileUpdatedEvent } from "../../domain/events/profile-updated.event.js";
import type { CreateProfileInput } from "../../domain/entities/profile.entity.js";
import type { ProfileRepository } from "../../domain/repositories/profile.repository.js";
import type { ProfileResponseDto } from "../dto/profile-response.dto.js";

type CreateProfileCommand = {
  userId: string;
  input: CreateProfileInput;
};

export class CreateProfileUseCase implements UseCase<CreateProfileCommand, ProfileResponseDto> {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ userId, input }: CreateProfileCommand): Promise<ProfileResponseDto> {
    const existing = await this.profileRepository.findByUserId(userId);

    if (existing) {
      throw new ConflictError("Profile already exists");
    }

    const profile = await this.profileRepository.create(userId, input);
    const withUser = await this.profileRepository.findWithUserByUserId(userId);

    if (!withUser) {
      throw new ConflictError("Profile could not be loaded after creation");
    }

    await this.eventBus.publish(
      new ProfileUpdatedEvent({
        userId,
        profile,
      }),
    );

    return {
      data: withUser,
      message: "Profile created successfully",
    };
  }
}
