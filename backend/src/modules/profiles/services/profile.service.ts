import { ConflictError } from "../../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { profileRepository, type ProfileRepository } from "../repositories/profile.repository.js";
import type { CreateProfileInput, Profile, UpdateProfileInput } from "../types/profile.types.js";

export class ProfileService {
  constructor(private readonly profiles: ProfileRepository = profileRepository) {}

  getProfile(userId: string): Profile {
    const profile = this.profiles.findByUserId(userId);

    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    return profile;
  }

  createProfile(userId: string, input: CreateProfileInput): Profile {
    const existing = this.profiles.findByUserId(userId);

    if (existing) {
      throw new ConflictError("Profile already exists");
    }

    return this.profiles.create(userId, input);
  }

  updateProfile(userId: string, input: UpdateProfileInput): Profile {
    const updated = this.profiles.update(userId, input);

    if (!updated) {
      throw new NotFoundError("Profile not found");
    }

    return updated;
  }

  markComplete(userId: string): Profile {
    const updated = this.profiles.markComplete(userId);

    if (!updated) {
      throw new NotFoundError("Profile not found");
    }

    return updated;
  }
}

export const profileService = new ProfileService();
