import type { AuthProfile } from "../types/auth.types.js";
import type {
  AuthUserRepository,
  StoredAuthUser,
  UpsertGoogleUserInput,
} from "../domain/repositories/auth-user.repository.js";

const createDefaultUser = (): StoredAuthUser => ({
  id: "user_0001",
  name: "Matias Silva",
  email: "matias.silva@email.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Matias",
  provider: "google",
  createdAt: new Date().toISOString(),
  onboardingCompleted: false,
  profile: null,
});

let users = new Map<string, StoredAuthUser>([[createDefaultUser().id, createDefaultUser()]]);

export class InMemoryAuthUserRepository implements AuthUserRepository {
  async findByEmail(email: string): Promise<StoredAuthUser | null> {
    return [...users.values()].find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<StoredAuthUser | null> {
    return users.get(id) ?? null;
  }

  async upsertFromGoogle(input: UpsertGoogleUserInput): Promise<StoredAuthUser> {
    const existing = await this.findByEmail(input.email);
    const stored: StoredAuthUser = {
      ...(existing ?? createDefaultUser()),
      name: input.name,
      email: input.email,
      avatar: input.avatar,
      provider: input.provider,
      profile: existing?.profile ?? null,
      onboardingCompleted: existing?.onboardingCompleted ?? false,
    };

    users.set(stored.id, stored);
    return stored;
  }

  async updateProfile(
    userId: string,
    profile: AuthProfile,
    onboardingCompleted = true,
  ): Promise<StoredAuthUser | null> {
    const user = users.get(userId);
    if (!user) return null;

    const updated: StoredAuthUser = {
      ...user,
      profile,
      onboardingCompleted,
    };

    users.set(userId, updated);
    return updated;
  }

  reset(): void {
    users = new Map([[createDefaultUser().id, createDefaultUser()]]);
  }
}

export const inMemoryAuthUserRepository = new InMemoryAuthUserRepository();

// Re-export for backwards compatibility in tests
export type StoredUser = StoredAuthUser;
export class UserRepository extends InMemoryAuthUserRepository {}
export const userRepository = inMemoryAuthUserRepository;
