import type { UseCase } from "../../../../shared/application/use-case.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import type { ProfileRepository } from "../../domain/repositories/profile.repository.js";
import type { ProfileResponseDto } from "../dto/profile-response.dto.js";

export class GetProfileUseCase implements UseCase<string, ProfileResponseDto> {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(userId: string): Promise<ProfileResponseDto> {
    const profile = await this.profileRepository.findWithUserByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    return { data: profile };
  }
}
