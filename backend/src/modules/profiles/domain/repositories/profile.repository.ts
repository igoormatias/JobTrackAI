import type { CreateProfileInput, Profile, UpdateProfileInput } from "../entities/profile.entity.js";

export interface ProfileRepository {
  findByUserId(userId: string): Promise<Profile | null>;
  findWithUserByUserId(userId: string): Promise<(Profile & { user: { name: string; email: string; avatarUrl: string | null } }) | null>;
  create(userId: string, input: CreateProfileInput): Promise<Profile>;
  update(userId: string, input: UpdateProfileInput): Promise<Profile | null>;
  markComplete(userId: string): Promise<Profile | null>;
}
