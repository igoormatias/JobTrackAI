import type {
  CreateProfileInput,
  Profile,
  UpdateProfileInput,
} from "../../domain/entities/profile.entity.js";
import type { ProfileRepository } from "../../domain/repositories/profile.repository.js";

const createEmptyProfile = (userId: string): Profile => ({
  id: `profile_${userId}`,
  userId,
  headline: "",
  area: null,
  seniority: null,
  modality: null,
  location: "",
  locationPreference: null,
  salaryExpectation: null,
  salaryBand: null,
  skillNames: [],
  bio: "",
  linkedinUrl: null,
  githubUrl: null,
  onboardingProgress: null,
  onboardingCompleted: false,
  extensions: {},
  updatedAt: new Date().toISOString(),
});

const users = new Map<string, { name: string; email: string; avatarUrl: string | null }>();

export class InMemoryProfileRepository implements ProfileRepository {
  private profiles = new Map<string, Profile>();

  seedUser(userId: string, user: { name: string; email: string; avatarUrl: string | null }): void {
    users.set(userId, user);
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profiles.get(userId) ?? null;
  }

  async findWithUserByUserId(userId: string) {
    const profile = this.profiles.get(userId);
    const user = users.get(userId);

    if (!profile || !user) return null;

    return {
      ...profile,
      user,
    };
  }

  async create(userId: string, input: CreateProfileInput): Promise<Profile> {
    const profile: Profile = {
      ...createEmptyProfile(userId),
      ...input,
      id: `profile_${userId}`,
      userId,
      skillNames: input.skillNames ?? [],
      updatedAt: new Date().toISOString(),
    };

    this.profiles.set(userId, profile);
    return profile;
  }

  async update(userId: string, input: UpdateProfileInput): Promise<Profile | null> {
    const existing = this.profiles.get(userId);
    if (!existing) return null;

    const updated: Profile = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.profiles.set(userId, updated);
    return updated;
  }

  async markComplete(userId: string): Promise<Profile | null> {
    return this.update(userId, { onboardingCompleted: true });
  }

  reset(): void {
    this.profiles = new Map();
    users.clear();
  }
}
