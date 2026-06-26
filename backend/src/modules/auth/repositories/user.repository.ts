import type { AuthProfile, AuthUser } from "../types/auth.types.js";

type StoredUser = AuthUser & {
  profile: AuthProfile | null;
};

const createDefaultUser = (): StoredUser => ({
  id: "user_0001",
  name: "Matias Silva",
  email: "matias.silva@email.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Matias",
  provider: "google",
  createdAt: new Date().toISOString(),
  onboardingCompleted: false,
  profile: null,
});

let users = new Map<string, StoredUser>([[createDefaultUser().id, createDefaultUser()]]);

export class UserRepository {
  findByEmail(email: string): StoredUser | null {
    return [...users.values()].find((user) => user.email === email) ?? null;
  }

  findById(id: string): StoredUser | null {
    return users.get(id) ?? null;
  }

  upsertFromGoogle(user: Omit<StoredUser, "profile" | "onboardingCompleted"> & Partial<Pick<StoredUser, "profile" | "onboardingCompleted">>): StoredUser {
    const existing = this.findByEmail(user.email);
    const stored: StoredUser = {
      ...(existing ?? createDefaultUser()),
      ...user,
      profile: existing?.profile ?? user.profile ?? null,
      onboardingCompleted: existing?.onboardingCompleted ?? user.onboardingCompleted ?? false,
    };

    users.set(stored.id, stored);
    return stored;
  }

  updateProfile(userId: string, profile: AuthProfile, onboardingCompleted = true): StoredUser | null {
    const user = users.get(userId);
    if (!user) return null;

    const updated: StoredUser = {
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

export const userRepository = new UserRepository();
